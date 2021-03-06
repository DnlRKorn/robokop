#!/usr/bin/env python

import os
from managerJobSubmitter import ManagerJobSubmitter 

job_submitter = ManagerJobSubmitter()
job_submitter.manager_url = 'http://robokop.renci.org'
job_submitter.username = os.environ['ADMIN_EMAIL']
job_submitter.password = os.environ['ADMIN_PASSWORD']

init_dir = os.path.dirname(os.path.realpath(__file__))

try:
    os.makedirs(f'{init_dir}/jobs/cop_disease_2')
except:
    pass

job_submitter.submit_from_template(f'{init_dir}/job_lists/cops_new.csv', f'{init_dir}/templates/cop_disease.json', f'{init_dir}/jobs/cop_disease_2')

try:
    os.makedirs(f'{init_dir}/jobs/cop_phenotype_2')
except:
    pass


job_submitter.submit_from_template(f'{init_dir}/job_lists/cops_new.csv', f'{init_dir}/templates/cop_phenotype.json', f'{init_dir}/jobs/cop_phenotype_2')
