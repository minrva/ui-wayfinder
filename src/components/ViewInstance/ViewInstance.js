import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types';
import { Row, Col, KeyValue, Select } from '@folio/stripes/components'
import { intlShape, injectIntl } from 'react-intl'

class ViewInstance extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
    title: PropTypes.string.isRequired,
    contributors: PropTypes.arrayOf(PropTypes.object).isRequired,
    publishers: PropTypes.arrayOf(PropTypes.object).isRequired,
    holdings: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedHoldingId: PropTypes.string.isRequired,
    callNumber: PropTypes.string.isRequired,
    onChangeHolding: PropTypes.func.isRequired,
  }

  formatContributors = (contributors) => {
    return contributors.length ? _.map(contributors, 'name').join('; ') : '–'
  }

  formatPublications = (publications) => {
    return publications.length ? _.map(publications, function (publication) {
      const publisher = _.get(publication, ['publisher'], '')
      const dateOfPublication = _.get(publication, ['dateOfPublication'], '')
      const formattedDateOfPublication = dateOfPublication ? `(${dateOfPublication})` : ''
      return `${publisher} ${formattedDateOfPublication}`
    }).join('; ') : '–'
  }

  render() {
    const {
      intl, title, contributors, publishers, holdings, selectedHoldingId, callNumber, onChangeHolding
    } = this.props
    const titleLbl = `${intl.formatMessage({ id: 'ui-wayfinder.instance.title' })}`
    const contributorsLbl = `${intl.formatMessage({ id: 'ui-wayfinder.instance.contributors' })}`
    const publishersLbl = `${intl.formatMessage({ id: 'ui-wayfinder.instance.publishers' })}`
    const locationLbl = `${intl.formatMessage({ id: 'ui-wayfinder.instance.location' })}`
    const callNumberLbl = `${intl.formatMessage({ id: 'ui-wayfinder.instance.callNumber' })}`
    return (
      <Col xs={12}>
        <Row>
          <Col xs={12}>
            <KeyValue label={titleLbl} value={title ? title : '–'} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue label={contributorsLbl} value={this.formatContributors(contributors)} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue label={publishersLbl} value={this.formatPublications(publishers)} />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            <Select
              label={locationLbl}
              value={selectedHoldingId}
              dataOptions={holdings}
              onChange={onChangeHolding} />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            <KeyValue label={callNumberLbl} value={callNumber} />
          </Col>
        </Row>
      </Col>
    )
  }
}

export default injectIntl(ViewInstance)
