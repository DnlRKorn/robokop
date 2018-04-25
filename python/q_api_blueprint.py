'''
Blueprint for /api/q/* endpoints
'''

import random
import string
import os
import sys
import re
from datetime import datetime
from flask import Blueprint, jsonify, render_template, request
from flask_security import auth_required
from flask_security.core import current_user
from flask_restplus import Resource

from question import Question, get_question_by_id
from answer import list_answersets_by_question_hash
from tasks import initialize_question, answer_question, update_kg
from util import getAuthData, get_tasks
from setup import db, api
from logging_config import logger

greent_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', 'robokop-interfaces')
sys.path.insert(0, greent_path)
from greent import node_types

@api.route('/q/<question_id>/answer')
class AnswerQuestion(Resource):
    @auth_required('session', 'basic')
    def post(self, question_id):
        """Answer question"""
        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404
        question_hash = question.hash
        username = current_user.username
        # Answer a question
        task = answer_question.apply_async(args=[question_hash], kwargs={'question_id':question_id, 'user_email':username})
        return jsonify({'task_id':task.id}), 202

@api.route('/q/<question_id>/refresh_kg')
class RefreshKG(Resource):
    @auth_required('session', 'basic')
    def post(self, question_id):
        """Refresh KG for question"""
        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404
        question_hash = question.hash
        username = current_user.username
        # Update the knowledge graph for a question
        task = update_kg.apply_async(args=[question_hash], kwargs={'question_id':question_id, 'user_email':username})
        return jsonify({'task_id':task.id}), 202

@api.route('/q/<question_id>')
class QuestionAPI(Resource):
    @auth_required('session', 'basic')
    def post(self, question_id):
        """Edit question metadata"""
        logger.info('Editing question %s', question_id)
        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404
        if not (current_user == question.user or current_user.has_role('admin')):
            return "UNAUTHORIZED", 401 # not authorized
        question.name = request.json['name']
        question.notes = request.json['notes']
        question.natural_question = request.json['natural_question']
        db.session.commit()
        return "SUCCESS", 200

    @auth_required('session', 'basic')
    def delete(self, question_id):
        """Delete question"""
        logger.info('Deleting question %s', question_id)
        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404
        if not (current_user == question.user or current_user.has_role('admin')):
            return "UNAUTHORIZED", 401 # not authorized
        db.session.delete(question)
        db.session.commit()
        return "SUCCESS", 200

    def get(self, question_id):
        """Get question"""

        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404

        user = getAuthData()
        answerset_list = list_answersets_by_question_hash(question.hash)

        now_str = datetime.now().__str__()
        return jsonify({'timestamp': now_str,
                        'user': user,
                        'question': question.toJSON(),
                        'owner': question.user.email,
                        'answerset_list': [a.toJSON() for a in answerset_list]})

@api.route('/q/<question_id>/tasks')
class QuestionTasks(Resource):
    def get(self, question_id):
        """Get list of queued tasks for question"""

        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404

        question_hash = question.hash

        tasks = get_tasks().values()

        # filter out tasks for other questions
        tasks = [t for t in tasks if (re.match(r"\['(.*)'\]", t['args']).group(1) if t['args'] else None) == question_hash]

        # filter out the SUCCESS/FAILURE tasks
        tasks = [t for t in tasks if not (t['state'] == 'SUCCESS' or t['state'] == 'FAILURE')]

        # split into answer and update tasks
        answerers = [t for t in tasks if t['name'] == 'tasks.answer_question']
        updaters = [t for t in tasks if t['name'] == 'tasks.update_kg']
        initializers = [t for t in tasks if t['name'] == 'tasks.initialize_question']

        return jsonify({'answerers': answerers,
                        'updaters': updaters,
                        'initializers': initializers})

@api.route('/q/<question_id>/subgraph')
class QuestionSubgraph(Resource):
    def get(self, question_id):
        """Get question subgraph"""

        try:
            question = get_question_by_id(question_id)
        except Exception as err:
            return "Invalid question key.", 404
            
        subgraph = question.relevant_subgraph()

        return jsonify(subgraph)
