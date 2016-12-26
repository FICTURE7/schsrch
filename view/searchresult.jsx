const React = require('react')
const PaperUtils = require('./paperutils.js')
const PaperSet = require('./paperset.jsx')
const Feedback = require('./feedback.jsx')

class SearchResult extends React.Component {
  constructor () {
    super()
    this.state = {
      err: null,
      result: null,
      loading: false,
      query: ''
    }
  }
  componentDidMount () {
    if (typeof this.props.query === 'string') {
      this.query(this.props.query)
    }
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.query !== nextProps.query) {
      this.query(nextProps.query)
    }
  }
  query (query) {
    this.setState({query: query})
    this.props.onStateChange && this.props.onStateChange(true)
    this.setState({err: null, loading: true})
    fetch('/search/' + encodeURIComponent(query) + '/').then(res => res.json()).then(result => {
      if (result.response === 'error') {
        this.error(query, result.err)
        return
      }
      this.result(query, result)
    }, err => {
      this.error(query, err)
    })
  }
  result (query, result) {
    if (this.state.query !== query) {
      return
    }
    this.setState({result: result, err: null, loading: false})
    this.props.onStateChange && this.props.onStateChange(false)
  }
  error (query, err) {
    if (this.state.query !== query) {
      return
    }
    this.setState({result: null, err: err, loading: false})
    this.props.onStateChange && this.props.onStateChange(false)
  }
  render () {
    return (
      <div className={'searchresult' + (this.state.loading ? ' loading' : '') + (this.props.smallerSetName ? ' smallsetname' : '')}>
        {this.state.err
          ? <div className='error'>{this.state.err.message}</div>
          : null}
        {this.state.result
          ? this.renderResult(this.state.result, this.state.query)
          : null}
        <a className='fbBtn' onClick={evt => Feedback.show(this.state.query)}>Report issues/missing/errors with this search...</a>
      </div>
    )
  }
  renderResult (result, query) {
    if ((!result.list || result.list.length === 0) && result.response.match(/^(pp|text)$/)) {
      result.response = 'empty'
    }
    switch (result.response) {
      case 'overflow':
        return (
          <div className='overflow'>Too much entities found. Try search something more specific...</div>
        )
      case 'empty':
        return (
          <div className='empty'>Your search returned no results.</div>
        )
      case 'pp':
        let bucket = []
        result.list.forEach(entity => {
          let existing = bucket.find(x => PaperUtils.setEqual(x, entity))
          if (existing) {
            existing.types.push(entity)
          } else {
            bucket.push({
              subject: entity.subject,
              time: entity.time,
              paper: entity.paper,
              variant: entity.variant,
              types: [
                entity
              ]
            })
          }
        })
        return (
          <div className='pplist'>
            {bucket.sort(PaperUtils.funcSortBucket).map(set => (
              <PaperSet paperSet={set} key={PaperUtils.setToString(set)} />
            ))}
          </div>
        )
      case 'text':
        return (
          <div className='fulltextlist'>
            {result.list.map(set => {
              let metas = {subject: set.doc.subject, time: set.doc.time, paper: set.doc.paper, variant: set.doc.variant}
              return (<PaperSet
                paperSet={Object.assign({}, metas, {types: [Object.assign({}, set.doc, {ftIndex: set.index}), ...set.related.map(x => Object.assign({}, metas, x))]})}
                key={set.index._id}
                indexQuery={query}
                />)
            })}
          </div>
        )
      default:
        return null
    }
  }
}

module.exports = SearchResult