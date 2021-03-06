import React from 'react';
import PropTypes from 'prop-types';

import { Panel, FormControl } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';

import LoadingImg from '../../../assets/images/loading.gif';
import FailureImg from '../../../assets/images/failure.png';
import SuccessImg from '../../../assets/images/success.png';
import RevokedImg from '../../../assets/images/revoked.png';


class ActivityTableAgGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quickFilterText: '',
    };

    this.onClick = this.onClick.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
    this.onFilterTextChange = this.onFilterTextChange.bind(this);
    this.getRowClass = this.getRowClass.bind(this);

    this.cellRendererStatus = this.cellRendererStatus.bind(this);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }
  onClick(event) {
    this.props.onClick(event.node.data);
  }
  onFilterTextChange(event) {
    this.setState({ quickFilterText: event.target.value });
  }
  getRowClass(params) {
    if (params.data.isUserOwned) {
      return 'question-row-is-owned';
    }
    return 'question-row-is-unowned';
  }
  cellRendererStatus(params) {
    let out = params.value;
    const isBusy = (params.value !== 'Zombie' && params.value !== 'Complete');
    const isFailure = params.value === 'Zombie';
    const isSuccess = params.value === 'Complete';
    const isRevoked = params.value === 'REVOKED';

    if (isBusy) {
      out = `<div style="
        display: table;
        width: 100%;
        position: absolute;
        height: 100%;">
          <div style="
            display: table-cell;
            vertical-align: middle;
          ">
            <img src=../${LoadingImg} height="25" width="25" />
          </div>
        </div>`;
    }
    if (isFailure) {
      out = `<div style="
        display: table;
        width: 100%;
        position: absolute;
        height: 100%;">
          <div style="
            display: table-cell;
            vertical-align: middle;
          ">
            <img src=../${FailureImg} height="25" width="25" />
          </div>
        </div>`;
    }
    if (isSuccess) {
      out = `<div style="
        display: table;
        width: 100%;
        position: absolute;
        height: 100%;">
          <div style="
            display: table-cell;
            vertical-align: middle;
          ">
            <img src=../${SuccessImg} height="25" width="25" />
          </div>
        </div>`;
    }
    if (isRevoked) {
      out = `<div style="
        display: table;
        width: 100%;
        position: absolute;
        height: 100%;">
          <div style="
            display: table-cell;
            vertical-align: middle;
          ">
            <img src=../${RevokedImg} height="25" width="25" />
          </div>
        </div>`;
    }
    return out;
  }
  cellRendererOwned(params) {
    let out = '';
    if (params.value) {
      out = '*';
    }
    return out;
  }
  render() {
    return (
      <div>
        <Panel>
          <Panel.Heading>
            {this.props.showSearch &&
              <FormControl
                id="filterText"
                type="text"
                placeholder="Search"
                onChange={this.onFilterTextChange}
              />
            }
          </Panel.Heading>
          <Panel.Body style={{ padding: '0px' }}>
            <div className="ag-theme-material" style={{ width: '100%', height: this.props.height }}>
              <AgGridReact
                columnDefs={[
                  {
                    headerName: '*',
                    field: 'isUserOwned',
                    suppressMenu: true,
                    suppressSorting: true,
                    cellRenderer: this.cellRendererOwned,
                    width: 5,
                    hide: true,
                    tooltip: value => (value ? 'This is your task' : ''),
                    suppressResize: true,
                  },
                  {
                    headerName: 'ID',
                    field: 'id',
                    suppressMenu: true,
                    suppressSorting: true,
                    width: 125,
                  },
                  {
                    headerName: 'Question ID',
                    field: 'questionId',
                    suppressMenu: true,
                    suppressSorting: true,
                    width: 125,
                  },
                  {
                    headerName: 'Type',
                    field: 'typeName',
                    suppressMenu: true,
                    suppressSorting: true,
                    width: 50,
                  },
                  {
                    headerName: 'Started',
                    field: 'startingTimestamp',
                    suppressMenu: true,
                    suppressSorting: true,
                    width: 100,
                  },
                  {
                    headerName: 'Status',
                    headerClass: 'no-padding',
                    field: 'status',
                    suppressMenu: true,
                    suppressSorting: true,
                    cellRenderer: this.cellRendererStatus,
                    width: 50,
                    minWidth: 20,
                    hide: false,
                    cellClass: 'no-padding',
                  },
                ]}
                rowData={this.props.tasks}
                getRowClass={this.getRowClass}
                enableFiltering
                enableSorting

                quickFilterText={this.state.quickFilterText}
                suppressMovableColumns
                suppressCellSelection
                defaultColDef={{ width: 100, headerComponentParams: { template: '' } }}
                rowSelection="single"
                onCellClicked={this.onClick}
                onGridReady={this.onGridReady}
              />
              <div className="fadeout" />
            </div>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

ActivityTableAgGrid.defaultProps = {
  height: '100px',
};

ActivityTableAgGrid.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tasks: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
  showSearch: PropTypes.bool.isRequired,
};

export default ActivityTableAgGrid;
