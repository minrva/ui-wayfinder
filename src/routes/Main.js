import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Pane, Paneset } from '@folio/stripes/components'
import InstanceForm from '../components/InstanceForm'
import ViewInstance from '../components/ViewInstance'
import IndoorMap from '../components/IndoorMap'
import { SubmissionError } from 'redux-form'
import { intlShape, injectIntl } from 'react-intl'
import { defaultItemIdentifier } from '@folio/wayfinder/src/constants'

class Main extends React.Component {

  static manifest = Object.freeze({
    query: { initialValue: {} },
    selectedInstance: { initialValue: {} },
    selectedHolding: { initialValue: {} },
    instances: {
      type: 'okapi',
      records: 'instances',
      path: 'inventory/instances',
      accumulate: true,
      fetch: false,
    },
    holdings: {
      type: 'okapi',
      records: 'holdingsRecords',
      path: 'holdings-storage/holdings',
      accumulate: true,
      fetch: false,
    },
    shelves: {
      type: 'okapi',
      records: 'shelves',
      path: 'shelves',
      accumulate: true,
      fetch: false,
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: true,
      fetch: false,
    },
    locations: {
      type: 'okapi',
      records: 'locations',
      path: 'locations?limit=100&query=cql.allRecords=1 sortby name',
    },
  })

  static propTypes = {
    intl: intlShape.isRequired,
    resources: PropTypes.shape({
      selectedInstance: PropTypes.object,
      instances: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selectedHolding: PropTypes.object,
      holdings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      selectedInstance: PropTypes.shape({
        replace: PropTypes.func,
      }),
      instances: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      selectedHolding: PropTypes.shape({
        replace: PropTypes.func,
      }),
      holdings: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      shelves: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
  }

  constructor(props) {
    super(props)
    this.instanceFormRef = React.createRef()
    this.state = { loading: false }
  }

  createShelfQuery = (holding) => {
    const { permanentLocationId, callNumber } = holding
    return `(lowerBound <= "${callNumber}" and upperBound >= "${callNumber}" and permanentLocationId = "${permanentLocationId}")`
  }

  buildIdentifierQuery(item, idents) {
    const query = idents.map(ident => `${patronIdentifierMap[ident]}="${item.identifier}"`)
    return `(${query.join(' OR ')})`
  }

  clearResources() {
    this.props.mutator.selectedInstance.replace({})
    this.props.mutator.instances.reset()
    this.props.mutator.selectedHolding.replace({})
    this.props.mutator.holdings.reset()
    this.props.mutator.shelves.reset()
  }

  onGetInstances = (instances) => {
    const { props } = this
    const instance = instances[0]
    const holdingsQuery = `(instanceId=="${instance.id}")`
    return props.mutator.holdings.GET({ params: { query: holdingsQuery } })
  }

  onGetHoldings = (holdings) => {
    const { props } = this
    if (holdings && holdings.length) {
      const holdingId = holdings[0].id
      this.setState({ holdingId: holdingId })
    }
    const selectedHolding = holdings[0]
    const shelvesQuery = this.createShelfQuery(selectedHolding)
    this.props.mutator.selectedHolding.replace(selectedHolding)
    return props.mutator.shelves.GET({ params: { query: shelvesQuery } })
  }

  onGetShelves = (shelves) => {
    return shelves;
  }

  handleSubmitInstanceForm = (data) => {
    const { intl } = this.props;
    const { item: instance } = data;
    if (!instance) {
      throw new SubmissionError({
        instance: {
          identifier: intl.formatMessage({ id: 'ui-wayfinder.main.missingDataError' }),
        },
      });
    }
    this.clearResources()
    const { identifier = '' } = instance
    const query = `(id=="${identifier}")`
    const { props, onGetInstances, onGetHoldings, onGetShelves } = this
    const { resources } = props
    this.setState({ loading: true })
    return props.mutator.instances.GET({ params: { query } })
      .then(onGetInstances)
      .then(onGetHoldings)
      .then(onGetShelves)
      .finally(() => this.setState({ loading: false }))
  }


  onChangeHolding = (e) => {
    const { target: { value: holdingId = '' } } = e
    const { props } = this
    const { resources } = props
    const holdings = (resources.holdings || {}).records || []
    const selectedHolding = holdings.find(function (holding) {
      return holding.id === holdingId
    });
    const shelvesQuery = this.createShelfQuery(selectedHolding)
    this.setState({ loading: true })
    this.props.mutator.selectedHolding.replace(selectedHolding)
    this.props.mutator.shelves.reset()
    return props.mutator.shelves.GET({ params: { query: shelvesQuery } })
      .then((shelves) => {
        return shelves
      })
      .finally(() => this.setState({ loading: false }))
  }

  getFirst = (els, defaultEl = null) => {
    return els && els.length ? els[0] : defaultEl
  }

  toHoldingOptions = (holdings, locations) => {
    const locationsById = _.keyBy(locations, 'id');
    return holdings.map(holding => {
      const { permanentLocationId, id: holdingId } = holding
      const holdingLocation = permanentLocationId ? locationsById[permanentLocationId].name : ''
      return { label: holdingLocation, value: holdingId }
    })
  }

  renderInstance = (instance, holdings, locations, selectedHolding, onChangeHolding) => {
    const title = _.get(instance, ['title'], '');
    const contributors = _.get(instance, ['contributors'], [])
    const publishers = _.get(instance, ['publication'], [])
    const holdingOptions = this.toHoldingOptions(holdings, locations)
    const selectedHoldingId = _.get(selectedHolding, ['id'], '')
    const callNumber = _.get(selectedHolding, ['callNumber'], '–')
    return <ViewInstance
      title={title}
      contributors={contributors}
      publishers={publishers}
      holdings={holdingOptions}
      selectedHoldingId={selectedHoldingId}
      callNumber={callNumber}
      onChangeHolding={onChangeHolding} />
  }

  renderMap = (shelf) => {
    const { mapTitle: title, mapUri: uri, label, upperBound, lowerBound, x, y } = shelf
    const coord = { x: x, y: y }
    return <IndoorMap
      title={title}
      uri={uri}
      coord={coord}
      label={label}
      lowerBound={lowerBound}
      upperBound={upperBound} />
  }

  render() {
    const { intl, resources } = this.props
    const { loading } = this.state
    const { selectedInstance = {}, selectedHolding = {} } = resources
    const instances = (resources.instances || {}).records || []
    const holdings = (resources.holdings || {}).records || []
    const locations = (resources.locations || {}).records || []
    const shelves = (resources.shelves || {}).records || []
    const instance = this.getFirst(instances)
    const shelf = this.getFirst(shelves)
    const instancePaneTitle = intl.formatMessage({ id: 'ui-wayfinder.main.selectInstance' })
    const mapPaneTitle = intl.formatMessage({ id: 'ui-wayfinder.main.instanceLocation' })
    return (
      <Paneset>
        <Pane
          defaultWidth="50%"
          paneTitle={instancePaneTitle}>
          <InstanceForm
            itemIdentifiers={[defaultItemIdentifier]}
            instance={selectedInstance}
            onSubmit={this.handleSubmitInstanceForm}
            ref={this.instanceFormRef}
            {...this.props} />
          <hr />
          {(() => {
            if (loading) {
              return <Icon icon="spinner-ellipsis" width="10px" />
            } else if (instance) {
              return this.renderInstance(instance, holdings, locations, selectedHolding, this.onChangeHolding)
            } else {
              return <span>No instance data found.</span>
            }
          })()}
        </Pane>
        <Pane
          defaultWidth="50%"
          paneTitle={mapPaneTitle}>
          {(() => {
            if (loading) {
              return <Icon icon="spinner-ellipsis" width="10px" />
            } else if (shelf) {
              return this.renderMap(shelf)
            } else {
              return <span>No map data found.</span>
            }
          })()}
        </Pane>
      </Paneset>
    )
  }
}

export default injectIntl(Main)
