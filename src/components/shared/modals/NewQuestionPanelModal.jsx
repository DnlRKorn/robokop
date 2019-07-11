import React from 'react';
import { observer } from 'mobx-react';
import { Modal, ButtonGroup, Button } from 'react-bootstrap';
import FaFloppyO from 'react-icons/lib/fa/floppy-o';
import FaTrash from 'react-icons/lib/fa/trash';
import FaUndo from 'react-icons/lib/fa/rotate-left';

import { panelTypes } from '../../../stores/newQuestionStore';
import HelpButton from '../HelpButton';
import getNodeTypeColorMap from '../../util/colorUtils';
import EdgePanel from '../../shared/EdgePanel';
import NodePanel from '../../shared/NodePanel';

const _ = require('lodash');

@observer
class NewQuestionPanelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.getBackgroundColor = this.getBackgroundColor.bind(this);
  }

  getBackgroundColor(nodePanel) {
    const { store } = this.props;
    // set the color of the node/edge panel header
    const panelColorMap = getNodeTypeColorMap(store.concepts);
    if (nodePanel) {
      return { backgroundColor: panelColorMap(store.activePanelState.type) };
    }
    // only find the node panels in store state.
    const nodeList = store.panelState.filter(panel => panel.panelType === 'node');
    const type1 = (nodeList[store.activePanelState.source_id] && nodeList[store.activePanelState.source_id].type) || 'edge';
    const type2 = (nodeList[store.activePanelState.target_id] && nodeList[store.activePanelState.target_id].type) || 'edge';
    const color1 = panelColorMap(type1);
    const color2 = panelColorMap(type2);
    return { backgroundImage: `linear-gradient(80deg, ${color1} 50%, ${color2} 50%)` };
  }

  render() {
    const { store } = this.props;
    const { activePanelState } = store;
    const isNodePanel = activePanelState.panelType === panelTypes.node;
    const unsavedChanges = store.isUnsavedChanges;
    const { isValid: isValidPanel } = store.activePanelState;
    const isNewPanel = store.activePanelInd === store.panelState.length;
    const backgroundColor = this.getBackgroundColor(isNodePanel);
    return (
      <div>
        {activePanelState.panelType &&
          <Modal
            show={store.showPanelModal}
            onHide={store.togglePanelModal}
            backdrop
          >
            <Modal.Header style={backgroundColor}>
              <Modal.Title style={{ height: '6%' }}>
                {`${isNodePanel ? 'Node' : 'Edge'} ${activePanelState.panelName} `}
                <HelpButton link="nedgePanel" />
                <ButtonGroup className="pull-right">
                  {!_.isEmpty(activePanelState) &&
                    <Button
                      onClick={store.saveActivePanel}
                      disabled={!unsavedChanges || !isValidPanel}
                      bsStyle={isValidPanel ? (unsavedChanges ? 'primary' : 'default') : 'danger'} // eslint-disable-line no-nested-ternary
                      title={isValidPanel ? (unsavedChanges ? 'Save changes' : 'No changes to save') : 'Fix invalid panel entries first'} // eslint-disable-line no-nested-ternary
                    >
                      <FaFloppyO style={{ verticalAlign: 'text-top' }} />
                      {' Save'}
                    </Button>
                  }
                  {!isNewPanel &&
                    <Button
                      onClick={store.revertActivePanel}
                      disabled={!unsavedChanges}
                      title={unsavedChanges ? 'Undo unsaved changes' : 'No changes to undo'}
                    >
                      <FaUndo style={{ verticalAlign: 'text-top' }} />
                      {' Undo'}
                    </Button>
                  }
                  {(store.panelState.length > 0) &&
                    <Button onClick={store.deleteActivePanel} title={`${isNewPanel ? 'Discard' : 'Delete'} current node`}>
                      <FaTrash style={{ verticalAlign: 'text-top' }} />{` ${isNewPanel ? 'Discard' : 'Delete'}`}
                    </Button>
                  }
                </ButtonGroup>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isNodePanel ?
                <NodePanel activePanel={activePanelState} />
                :
                <EdgePanel activePanel={activePanelState} />
              }
            </Modal.Body>
          </Modal>
        }
      </div>
    );
  }
}

export default NewQuestionPanelModal;
