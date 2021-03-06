import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

// Import static css, image, and font assets so that they can be found by webpack.
import 'bootstrap/dist/css/bootstrap.css'; // path search within node_modules
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-material.css';
import 'react-select/dist/react-select.css';
import 'react-widgets/dist/css/react-widgets.css';

import 'babel-polyfill'; // For IE Promises

import Landing from './simplePages/Landing';
import About from './simplePages/About';
import Help from './simplePages/Help';
import Guide from './simplePages/Guide';
import Alpha from './pages/alpha/Alpha';
import SimpleQuestion from './components/newQuestion/SimpleQuestion';
import Apps from './simplePages/Apps';
import TermsofService from './TermsofService';
import QuestionNew from './components/newQuestion/QuestionNew';
import QuestionNewLinear from './QuestionNewLinear';
import Question from './Question';
import QuestionList from './QuestionList';
import Answerset from './Answerset';
import Activity from './Activity';
import MultiSearch from './MultiSearch';
import SimpleViewer from './SimpleViewer';
import SimpleEnriched from './SimpleEnriched';
import SimpleSimilarity from './SimpleSimilarity';
import SimpleExpand from './SimpleExpand';
import Synonymize from './Synonymize';
import SimplePublications from './SimplePublications';
import NewQuestionStore from './stores/newQuestionStore';

// Our actual CSS and other images etc.
import '../assets/css/style.css';
import '../assets/images/favicon.ico';

const config = {
  ui: {
    enableNewAnswersets: true,
    enableNewQuestions: true,
    enableQuestionRefresh: true,
    enableQuestionEdit: true,
    enableQuestionDelete: true,
    enableQuestionFork: true,
    enableTaskStatus: true,
    enableAnswerFeedback: true,
  },
  // Add environmental dependent variables to config here.
  host: process.env.ROBOKOP_HOST,
  port: process.env.MANAGER_PORT_UI,
  protocol: process.env.ROBOKOP_PROTOCOL,
  graphqlPort: process.env.GRAPHQL_PORT_UI, // With our NGINX setup we no longer require a seperate more for the graphql
};

const robokop = {
  config,
  landing: () => {
    ReactDOM.render(
      <Landing
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  about: () => {
    ReactDOM.render(
      <About
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  help: () => {
    ReactDOM.render(
      <Help
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  guide: () => {
    ReactDOM.render(
      <Guide
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  apps: () => {
    ReactDOM.render(
      <Apps
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  termsofservice: () => {
    ReactDOM.render(
      <TermsofService
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  alpha: (identifier) => {
    ReactDOM.render(
      <Alpha
        config={config}
        identifier={identifier}
      />,
      document.getElementById('reactEntry'),
    );
  },
  questionList: () => {
    ReactDOM.render(
      <QuestionList
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  questionNew: (id) => {
    ReactDOM.render(
      <Provider store={new NewQuestionStore()}>
        <QuestionNew
          config={config}
          initializationId={id}
        />
      </Provider>,
      document.getElementById('reactEntry'),
    );
  },
  questionNewLinear: (id) => {
    ReactDOM.render(
      <QuestionNewLinear
        config={config}
        initializationId={id}
      />,
      document.getElementById('reactEntry'),
    );
  },
  search: () => {
    ReactDOM.render(
      <MultiSearch
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  activity: () => {
    ReactDOM.render(
      <Activity
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  question: (questionId) => {
    ReactDOM.render(
      <Question
        config={config}
        id={questionId}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simpleQuestion: (id) => { // ask simple question without signing in
    ReactDOM.render(
      <Provider store={new NewQuestionStore()}>
        <SimpleQuestion
          config={config}
          initializationId={id}
        />
      </Provider>,
      document.getElementById('reactEntry'),
    );
  },
  answerset: (answersetId, answerId) => {
    ReactDOM.render(
      <Answerset
        config={config}
        id={answersetId}
        answerId={answerId}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simpleView: (id) => {
    ReactDOM.render(
      <SimpleViewer
        config={config}
        id={id}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simpleEnriched: () => {
    ReactDOM.render(
      <SimpleEnriched
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simpleSimilarity: () => {
    ReactDOM.render(
      <SimpleSimilarity
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simpleExpand: () => {
    ReactDOM.render(
      <Provider store={new NewQuestionStore()}>
        <SimpleExpand
          config={config}
        />
      </Provider>,
      document.getElementById('reactEntry'),
    );
  },
  synonymize: () => {
    ReactDOM.render(
      <Synonymize
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
  simplePublications: () => {
    ReactDOM.render(
      <SimplePublications
        config={config}
      />,
      document.getElementById('reactEntry'),
    );
  },
};

export { robokop, config };

