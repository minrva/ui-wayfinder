import { find } from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { Col, Row, TextField } from '@folio/stripes/components'
import { Pluggable } from '@folio/stripes/core'
import { intlShape, injectIntl } from 'react-intl'
import css from './InstanceForm.css'

import { itemIdentifierMap, itemLabelMap } from '@folio/wayfinder/src/constants'

class InstanceForm extends React.Component {
  
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    itemIdentifiers: PropTypes.arrayOf(PropTypes.string),
    change: PropTypes.func,
    submitting: PropTypes.bool,
    submitFailed: PropTypes.bool,
    instance: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    intl: intlShape.isRequired
  }

  constructor(props) {
    super(props)
    const { intl } = props
    this.selectInstance = this.selectInstance.bind(this)
    this.barcodeEl = React.createRef()

    // map column-IDs to table-header-values
    this.columnMapping = {
      title: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.title' }),
      contributors: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.contributors' }),
      publishers: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.publishers' }),
      relation: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.relation' }),
      hrid: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.hrid' })
    }
  }

  componentDidMount() {
    this.focusInput()
  }

  componentDidUpdate() {
    if (!this.barcodeEl.current) return

    const input = this.barcodeEl.current.getRenderedComponent().getInput()

    // Refocus on the item barcode input if the submitted value fails
    if (document.activeElement !== input && !this.props.instance.id && this.props.submitFailed) {
      setTimeout(() => this.focusInput())
    }
  }

  focusInput() {
    this.barcodeEl.current.getRenderedComponent().focusInput()
  }

  selectInstance(instance) {
    console.log(`selectInstance: ${JSON.stringify(instance)}`)
    const { itemIdentifiers, handleSubmit, intl } = this.props
    const ident = find(itemIdentifiers, i => instance[itemIdentifierMap[i]])

    if (ident) {
      this.props.change('item.identifier', instance[itemIdentifierMap[ident]])
      setTimeout(() => handleSubmit())
    } else {
      const { title } = instance
      const identifier = itemIdentifierMap[itemIdentifiers[0]]
      Object.assign(instance, { error: intl.formatMessage({ id: 'ui-wayfinder.instanceForm.missingIdentifierError' }, { title, identifier }) })
    }
  }

  render() {
    const { itemIdentifiers, submitting, handleSubmit, intl } = this.props
    const validationEnabled = false
    const disableRecordCreation = true
    const identifier = (itemIdentifiers.length > 1) ? 'id' : itemLabelMap[itemIdentifiers[0]]

    return (
      <form id="instance-form" onSubmit={handleSubmit}>
        <Row id="section-instance">
          <Col xs={12}>
            <Field
              id="input-item-identifier"
              name="item.identifier"
              className={css.hidden}
              placeholder={intl.formatMessage({ id: 'ui-wayfinder.instanceForm.scanOrEnterInstanceId' }, { identifier })}
              aria-label={intl.formatMessage({ id: 'ui-wayfinder.instanceForm.instanceIdentifier' })}
              fullWidth
              component={TextField}
              withRef
              ref={this.barcodeEl}
              validationEnabled={validationEnabled}
            />
            <Pluggable
              aria-haspopup="true"
              type="find-instance"
              id="clickable-find-instance"
              {...this.props}
              searchLabel={intl.formatMessage({ id: 'ui-wayfinder.instanceForm.instanceLookup' })}
              marginTop0
              searchButtonStyle="link"
              dataKey="instance"
              selectInstance={this.selectInstance}
              onCloseModal={(modalProps) => {
                modalProps.parentMutator.query.update({
                  query: '',
                  filters: 'active.Active',
                  sort: 'Title',
                })
              }}
              visibleColumns={['title', 'contributors', 'publishers', 'relation']}
              columnMapping={this.columnMapping}
              disableRecordCreation={disableRecordCreation}
            />
          </Col>
        </Row>
      </form>
    )
  }
}

export default reduxForm({
  form: 'instanceForm',
})(injectIntl(InstanceForm))
