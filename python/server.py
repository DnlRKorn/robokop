#!/usr/bin/env python

"""Flask web server thread"""

import os
import re
from datetime import datetime

from flask import jsonify, render_template
from flask_security import Security, SQLAlchemySessionUserDatastore, auth_required
from flask_login import login_required

from setup import app, db
from logging_config import logger
from user import User, Role
from questions_blueprint import questions
from q_blueprint import q
from a_blueprint import a
from util import get_tasks, getAuthData

import manager

# Setup flask-security with user tables
user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
security = Security(app, user_datastore)

# Initialization
@app.before_first_request
def init():
    pass

app.register_blueprint(questions, url_prefix='/questions')
app.register_blueprint(q, url_prefix='/q')
app.register_blueprint(a, url_prefix='/a')

# Flask Server code below
################################################################################

@app.route('/')
def landing():
    """Initial contact. Give the initial page."""
    return render_template('landing.html')

# from celery.app.control import Inspect
@app.route('/tasks')
def show_tasks():
    """Fetch queued/active task list"""
    tasks = get_tasks()
    output = []
    output.append('{:<40}{:<30}{:<40}{:<20}{:<20}'.format('task id', 'name', 'question hash', 'user', 'state'))
    output.append('-'*150)
    for task_id in tasks:
        task = tasks[task_id]
        name = task['name'] if task['name'] else ''
        question_hash = re.match(r"\['(.*)'\]", task['args']).group(1) if task['args'] else ''
        # question_id = re.search(r"'question_id': '(\w*)'", task['kwargs']).group(1) if task['kwargs'] and not task['kwargs'] == '{}' else ''
        user_email = re.search(r"'user_email': '([\w@.]*)'", task['kwargs']).group(1) if task['kwargs'] and not task['kwargs'] == '{}' else ''
        state = task['state'] if task['state'] else ''
        output.append('{:<40}{:<30}{:<40}{:<20}{:<20}'.format(task_id, name, question_hash, user_email, state))

    return "<pre>"+"\n".join(output)+"</pre>"

################################################################################
##### Run Webserver ############################################################
################################################################################

if __name__ == '__main__':

    # Get host and port from environmental variables
    server_host = os.environ['ROBOKOP_HOST']
    server_port = int(os.environ['ROBOKOP_PORT'])

    app.run(host=server_host,\
        port=server_port,\
        debug=False,\
        use_reloader=False)
