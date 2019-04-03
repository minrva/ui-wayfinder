import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Row, Col, KeyValue } from '@folio/stripes/components'
import css from './IndoorMap.css'
import { intlShape, injectIntl } from 'react-intl'
import { indoorMap } from '@folio/wayfinder/src/constants';

class IndoorMap extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
    title: PropTypes.string.isRequired,
    uri: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    upperBound: PropTypes.string.isRequired,
    lowerBound: PropTypes.string.isRequired,
    coord: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired
  }

  render() {
    const { intl, title, uri, label, lowerBound, upperBound } = this.props
    const { WIDTH, HEIGHT } = indoorMap
    const locationLbl = `${intl.formatMessage({ id: 'ui-wayfinder.indoorMap.location' })}`
    const shelfRangeLbl = `${intl.formatMessage({ id: 'ui-wayfinder.indoorMap.shelfRange' })}`
    const shelfLabelLbl = `${intl.formatMessage({ id: 'ui-wayfinder.indoorMap.shelfLabel' })}`
    const range = `${lowerBound} to ${upperBound}`
    return (
      <div>
        <Col xs={12}>
          <Row>
            <Col xs={4}>
              <KeyValue label={locationLbl} value={title} />
            </Col>
            <Col xs={4}>
              <KeyValue label={shelfRangeLbl} value={range} />
            </Col>
            <Col xs={4}>
              <KeyValue label={shelfLabelLbl} value={label} />
            </Col>
          </Row>
        </Col>
        <Layout className={css.indoorMap}>
          <canvas ref="canvas" width={WIDTH} height={HEIGHT} />
          <img ref="image" src={uri} alt={title} className={css.hidden} />
        </Layout>
      </div>
    )
  }

  componentDidMount() {
    const { RADIUS, COLOR } = indoorMap
    const canvas = this.refs.canvas
    const ctx = canvas.getContext("2d")
    const img = this.refs.image
    img.onload = () => {
      const { coord: { x, y } } = this.props
      ctx.drawImage(img, 0, 0)
      ctx.beginPath()
      ctx.arc(x, y, RADIUS, 0, 2 * Math.PI, false)
      ctx.fillStyle = COLOR
      ctx.fill()
    }
  }
}

export default injectIntl(IndoorMap)