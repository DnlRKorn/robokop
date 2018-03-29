import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

import KnowledgeGraphViewer from './KnowledgeGraphViewer';

class KnowledgeGraphFetchAndView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: false,
    };

    this.styles = {
      outerContainer: {
        padding: '10px',
        border: '1px solid #d1d1d1',
      },
      container: {
        border: '1px solid #d1d1d1',
        boxShadow: '0px 0px 5px #c3c3c3',
        margin: 'auto',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };

    this.fetch = this.fetch.bind(this);
  }

  fetch() {
    this.setState({ fetching: true });
    this.props.callbackFetchGraph(() => this.setState({ fetching: false }));
  }

  render() {
    const showGraph = !(this.props.subgraph === null);
    const showFetching = this.state.fetching;
    const showFetchButton = !showGraph && !showFetching;
    
    const propsStyle = { height: this.props.height, width: this.props.width };
    let containerStyle = this.styles.container;
    if (!showGraph) {
      containerStyle.backgroundColor = '#b8c6db';
      // containerStyle.backgroundImage = 'linear-gradient(315deg, #b8c6db 0%, #f5f7fa 74%)';
    } else {
      containerStyle.backgroundColor = '#fff';
    }

    return (
      <div>
        <h4>Local Knowledge Graph</h4>
        <div style={this.styles.outerContainer}>
          <div style={{ ...containerStyle, ...propsStyle }}>
            {showGraph &&
              <KnowledgeGraphViewer
                height={this.props.height}
                width={this.props.width}
                graph={this.props.subgraph}
                callbackRefresh={this.props.callbackRefresh}
              />
            }
            {showFetching &&
              <div>
                <h5>Downloading Knowledge Sub Graph</h5>
                <ProgressBar active now={100} />
              </div>
            }
            {showFetchButton &&
              <Button onClick={this.fetch}>
                Get Knowledge Sub Graph
              </Button>
            }
          </div>
        </div>
      </div>
    );
  }
}

KnowledgeGraphFetchAndView.defaultProps = {
  height: '500px',
  width: '500px',
  callbackFetchGraph: () => {},
  callbackRefresh: () => {},
};


export default KnowledgeGraphFetchAndView;
