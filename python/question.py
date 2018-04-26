'''
Question definition
'''

# standard modules
import os
import sys
import json
import hashlib
import warnings

# 3rd-party modules
from sqlalchemy.types import JSON
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship, backref

# our modules
from answer import list_answersets_by_question_hash
from user import User
from setup import db, rosetta
from logging_config import logger

# robokop-rank modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', 'robokop-rank'))
from nagaProto import ProtocopRank

# robokop-build modules
builder_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', 'robokop-build', 'builder')
sys.path.insert(0, builder_path)
from lookup_utils import lookup_identifier

# robokop-interfaces modules
greent_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', 'robokop-interfaces')
sys.path.insert(0, greent_path)
from greent import node_types
from greent.graph_components import KNode
from greent.synonymizers.disease_synonymizer import synonymize


class Question(db.Model):
    '''
    Represents a question such as "What genetic condition provides protection against disease X?"

    methods:
    * answer() - a struct containing the ranked answer paths
    * cypher() - the appropriate Cypher query for the Knowledge Graph
    '''

    __tablename__ = 'question'
    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    natural_question = Column(String)
    notes = Column(String)
    name = Column(String)
    nodes = Column(JSON)
    edges = Column(JSON)
    name = Column(String)
    hash = Column(String)
    
    user = relationship(
        User,
        backref=backref('questions',
                        uselist=True,
                        cascade='delete,all'))

    def __init__(self, *args, **kwargs):
        '''
        keyword arguments: id, user, notes, natural_question, nodes, edges
        q = Question(kw0=value, ...)
        q = Question(struct, ...)
        '''

        # initialize all properties
        self.user_id = None
        self.id = None
        self.notes = None
        self.name = None
        self.natural_question = None
        self.name = None
        self.nodes = [] # list of nodes
        self.edges = [] # list of edges
        self.hash = None

        # apply json properties to existing attributes
        attributes = self.__dict__.keys()
        if args:
            struct = args[0]
            for key in struct:
                if key in attributes:
                    setattr(self, key, struct[key])
                else:
                    warnings.warn("JSON field {} ignored.".format(key))

        # override any json properties with the named ones
        for key in kwargs:
            if key in attributes:
                setattr(self, key, kwargs[key])
            else:
                warnings.warn("Keyword argument {} ignored.".format(key))

        # replace input node names with identifiers
        for n in self.nodes:
            if n['nodeSpecType'] == 'Named Node':
                # identifiers = lookup_identifier(n['label'], n['type'], rosetta.core)
                identifiers = [n['meta']['identifier']]
                n['identifiers'] = identifiers
            else:
                n['identifiers'] = None

        self.hash = self.compute_hash()

        db.session.add(self)
        db.session.commit()

    @staticmethod
    def dictionary_to_graph(dictionary):
        '''
        Convert struct from blackboards database to nodes and edges structs
        '''

        query = dictionary

        # convert to list of nodes (with conditions) and edges with lengths
        nodes = [dict(n, **{"id":i}) for i, n in enumerate(query)\
            if not n['nodeSpecType'] == 'Unspecified Nodes']
        edges = [dict(start=i-1, end=i, length=[query[i-1]['meta']['numNodesMin']+1, query[i-1]['meta']['numNodesMax']+1])\
            if i > 0 and query[i-1]['nodeSpecType'] == 'Unspecified Nodes'\
            else dict(start=i-1, end=i, length=[1])\
            for i, n in enumerate(query)\
            if i > 0 and not n['nodeSpecType'] == 'Unspecified Nodes']

        return nodes, edges

    @property
    def answersets(self):
        return list_answersets_by_question_hash(self.hash)

    def compute_hash(self):
        '''
        Generate an MD5 hash of the machine readable question interpretation
        i.e. the nodes and edges attributes
        '''

        json_spec = {
            "nodes":self.nodes,
            "edges":self.edges
        }
        m = hashlib.md5()
        m.update(json.dumps(json_spec).encode('utf-8'))
        return m.hexdigest()

    def __str__(self):
        return "<ROBOKOP Question id={}>".format(self.id)

    def toJSON(self):
        keys = [str(column).split('.')[-1] for column in self.__table__.columns]
        struct = {key:getattr(self, key) for key in keys}
        return struct

def list_questions():
    return db.session.query(Question).all()

def list_questions_by_hash(hash):
    return db.session.query(Question).filter(Question.hash == hash).all()

def list_questions_by_username(username, invert=False):
    if invert:
        return db.session.query(Question).join(Question.user).filter(User.username != username).all()
    else:
        return db.session.query(Question).join(Question.user).filter(User.username == username).all()

def list_questions_by_user_id(user_id, invert=False):
    if invert:
        return db.session.query(Question).filter(Question.user_id != user_id).all()
    else:
        return db.session.query(Question).filter(Question.user_id == user_id).all()

def get_question_by_id(id):
    question = db.session.query(Question).filter(Question.id == id).first()
    if not question:
        raise KeyError("No such question.")
    return question