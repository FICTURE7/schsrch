const supertest = require('supertest')
const should = require('should')
const PaperUtils = require('../view/paperutils.js')

module.exports = schsrch =>
  describe('Search for specific paper', function () {
    function dsTest (query, expect) {
      expect = expect.sort().map(x => `0610_${x}`)
      it(`${query} as=json`, function (done) {
        supertest(schsrch)
          .get(`/search/?query=${encodeURIComponent(query)}&as=json`)
          .set('Host', 'schsrch.xyz')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(res => res.body.should.be.an.Object())
          .expect(res => res.body.response.should.equal('pp', 'Response should be "pp" type'))
          .expect(res => res.body.list.should.be.an.Array())
          .expect(res => res.body.list.forEach(x => x.should.be.an.Object()))
          .expect(res => res.body.list.forEach(x => x._id.should.be.a.String()))
          .expect(res => res.body.list.forEach(x => x.fileType.should.equal('pdf')))
          .expect(res => res.body.list.forEach(x => should.not.exist(x.doc)))
          .expect(res => res.body.list.forEach(x => should.not.exist(x.fileBlob)))
          .expect(res => res.body.list = res.body.list.map(x => `${PaperUtils.setToString(x)}_${x.type}`))
          .expect(res => res.body.list = res.body.list.sort())
          .expect(res => res.body.list.length.should.equal(expect.length, `Response should have ${expect.length} results returned. (Got ${res.body.list.join(', ')})`))
          .expect(res => res.body.list.should.deepEqual(expect))
          .end(done)
      })
      it(`${query} as=raw`, function (done) {
        supertest(schsrch)
          .get(`/search/?query=${encodeURIComponent(query)}&as=raw`)
          .set('Host', 'schsrch.xyz')
          .expect('Content-Type', /text/)
          .expect(200)
          .expect(res => res.text.should.be.an.String())
          .expect(res => {
            let list = res.text.split('\n').filter(x => x.length !== 0)
            list.length.should.equal(expect.length, `Response should have ${expect.length} results returned.`)
            list = list.sort()
            list.should.deepEqual(expect)
          })
          .end(done)
      })
    }
    dsTest('0609', [])
    dsTest('0609 s16', [])
    dsTest('0609s16', [])
    ;['0610 ', '0610'].forEach(s => {
      let isShortSubject = /^\d{4}$/.test(s)
      dsTest(s, ['s08_1_0_qp', 's12_0_0_gt', 's12_2_3_ms', 's12_2_3_qp', 's16_1_0_ms', 's16_1_0_qp', 's16_2_0_ms', 's16_2_0_qp', 's17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp', 'w16_1_1_qp', 'w16_1_1_ms'])

      dsTest(s + 's16', ['s16_1_0_ms', 's16_1_0_qp', 's16_2_0_ms', 's16_2_0_qp'])
      dsTest(s + 's17', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 'S16', ['s16_1_0_ms', 's16_1_0_qp', 's16_2_0_ms', 's16_2_0_qp'])
      dsTest(s + 'S17', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's18', [])
      dsTest(s + 'S18', [])
      dsTest(s + 'w16', ['w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'W16', ['w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'w17', [])
      dsTest(s + 'y17', [])

      dsTest(s + 'w16 qp', ['w16_1_1_qp'])
      dsTest(s + 's17 ms', ['s17_1_1_ms', 's17_1_2_ms'])

      dsTest(s + 'y17 11', [])
      dsTest(s + 's16 13', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 3', [])
      dsTest(s + 'w16 3', [])
      dsTest(s + 's16 1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's161', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's1610', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's17 11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's1711', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17 1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's171', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])

      isShortSubject || dsTest(s + '1', ['s08_1_0_qp', 's16_1_0_ms', 's16_1_0_qp', 's17_1_1_ms', 's17_1_1_qp', 's17_1_2_qp', 's17_1_2_ms', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'p1', ['s08_1_0_qp', 's16_1_0_ms', 's16_1_0_qp', 's17_1_1_ms', 's17_1_1_qp', 's17_1_2_qp', 's17_1_2_ms', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'paper1', ['s08_1_0_qp', 's16_1_0_ms', 's16_1_0_qp', 's17_1_1_ms', 's17_1_1_qp', 's17_1_2_qp', 's17_1_2_ms', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'paper 1', ['s08_1_0_qp', 's16_1_0_ms', 's16_1_0_qp', 's17_1_1_ms', 's17_1_1_qp', 's17_1_2_qp', 's17_1_2_ms', 'w16_1_1_qp', 'w16_1_1_ms'])
      isShortSubject || dsTest(s + '11', ['s17_1_1_ms', 's17_1_1_qp', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'p11', ['s17_1_1_ms', 's17_1_1_qp', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'paper 11', ['s17_1_1_ms', 's17_1_1_qp', 'w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(s + 'paper 11', ['s17_1_1_ms', 's17_1_1_qp', 'w16_1_1_qp', 'w16_1_1_ms'])
      isShortSubject || dsTest(s + '0', ['s12_0_0_gt'])
      dsTest(s + 'p0', ['s12_0_0_gt'])
      dsTest(s + 'paper 0', ['s12_0_0_gt'])

      dsTest(s + 'ms', ['s12_2_3_ms', 's16_1_0_ms', 's16_2_0_ms', 's17_1_1_ms', 's17_1_2_ms', 'w16_1_1_ms'])

      dsTest(s + 'y17 paper 11', [])
      dsTest(s + 's16 paper 13', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 paper 3', [])
      dsTest(s + 'w16 paper 3', [])
      dsTest(s + 's16 paper 1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 'S16 paper 1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 'y17 paper11', [])
      dsTest(s + 's16 paper13', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 paper3', [])
      dsTest(s + 'w16 paper3', [])
      dsTest(s + 's16 paper1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 'y17paper 11', [])
      dsTest(s + 's16paper 13', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16paper 3', [])
      dsTest(s + 'w16paper 3', [])
      dsTest(s + 's16paper 1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 'y17paper11', [])
      dsTest(s + 's16paper13', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16paper3', [])
      dsTest(s + 'w16paper3', [])
      dsTest(s + 's16paper1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16p1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 p1', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 paper 10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 paper10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16paper 10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16paper10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16p10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's16 p10', ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(s + 's17 paper 11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17 paper11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17paper 11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17paper11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17p11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17 p11', ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(s + 's17 1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17 paper 1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17 paper1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17paper 1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17paper1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17p1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])
      dsTest(s + 's17 p1', ['s17_1_1_ms', 's17_1_1_qp', 's17_1_2_ms', 's17_1_2_qp'])

      dsTest(s + 's16 1 ms', ['s16_1_0_ms'])
      dsTest(s + 's161qp', ['s16_1_0_qp'])
      dsTest(s + 's16 10 ms', ['s16_1_0_ms'])
      dsTest(s + 's1610qp', ['s16_1_0_qp'])
      dsTest(s + 's17 11 ms', ['s17_1_1_ms'])
      dsTest(s + 's1711qp', ['s17_1_1_qp'])
      dsTest(s + 's17 1 ms', ['s17_1_1_ms', 's17_1_2_ms'])
      dsTest(s + 's171qp', ['s17_1_1_qp', 's17_1_2_qp'])

      dsTest(s + 's16 paper 1 ms', ['s16_1_0_ms'])
      dsTest(s + 's16 paper1 ms', ['s16_1_0_ms'])
      dsTest(s + 's16 p1qp', ['s16_1_0_qp'])
      dsTest(s + 's16 paper 10 ms', ['s16_1_0_ms'])
      dsTest(s + 's16 paper10 ms', ['s16_1_0_ms'])
      dsTest(s + 's16 p10qp', ['s16_1_0_qp'])
      dsTest(s + 's17 paper 11 ms', ['s17_1_1_ms'])
      dsTest(s + 's17 paper11 ms', ['s17_1_1_ms'])
      dsTest(s + 's17 p11qp', ['s17_1_1_qp'])
      dsTest(s + 's17 paper 1 ms', ['s17_1_1_ms', 's17_1_2_ms'])
      dsTest(s + 's17 paper1 ms', ['s17_1_1_ms', 's17_1_2_ms'])
      dsTest(s + 's17 p1qp', ['s17_1_1_qp', 's17_1_2_qp'])

      dsTest(s + 's16 ms 1', ['s16_1_0_ms'])
      dsTest(s + 's16 ms paper 1', ['s16_1_0_ms'])
      dsTest(s + 's16qp1', ['s16_1_0_qp'])
      dsTest(s + 's16qpp1', ['s16_1_0_qp'])
      dsTest(s + 's16 ms 10', ['s16_1_0_ms'])
      dsTest(s + 's16 ms paper 10', ['s16_1_0_ms'])
      dsTest(s + 's16qp10', ['s16_1_0_qp'])
      dsTest(s + 's16qpp10', ['s16_1_0_qp'])
      dsTest(s + 's17 ms 11', ['s17_1_1_ms'])
      dsTest(s + 's17 ms paper 11', ['s17_1_1_ms'])
      dsTest(s + 's17qp11', ['s17_1_1_qp'])
      dsTest(s + 's17qpp11', ['s17_1_1_qp'])
      dsTest(s + 's17 ms 1', ['s17_1_1_ms', 's17_1_2_ms'])
      dsTest(s + 's17 ms paper 1', ['s17_1_1_ms', 's17_1_2_ms'])
      dsTest(s + 's17qp1', ['s17_1_1_qp', 's17_1_2_qp'])
      dsTest(s + 's17qpp1', ['s17_1_1_qp', 's17_1_2_qp'])

      dsTest(s + '_s16_ms_1.pdf', ['s16_1_0_ms'])
      dsTest(s + '_s17_ms_11.pdf', ['s17_1_1_ms'])

      dsTest(s + 's08', ['s08_1_0_qp'])
      dsTest(s + 's8', ['s08_1_0_qp'])
      dsTest(s + 's8p1', ['s08_1_0_qp'])
      dsTest(s + 's8 paper 1', ['s08_1_0_qp'])
      dsTest(s + 's8 1 qp', ['s08_1_0_qp'])
      dsTest(s + 's8 10', ['s08_1_0_qp'])
      dsTest(s + 's8 10 qp', ['s08_1_0_qp'])
      dsTest(s + 's8 12', ['s08_1_0_qp'])
      dsTest(s + 's8 12 qp', ['s08_1_0_qp'])

      dsTest(s + 's12', ['s12_0_0_gt', 's12_2_3_ms', 's12_2_3_qp'])
      dsTest(s + 's12 2', ['s12_0_0_gt', 's12_2_3_ms', 's12_2_3_qp'])
      dsTest(s + 's12 22', ['s12_0_0_gt'])
      dsTest(s + 's12 23', ['s12_0_0_gt', 's12_2_3_ms', 's12_2_3_qp'])
    })

    ;[true, false].forEach(withExtraSlash => {
      dsTest(`0610/11/M${withExtraSlash ? '/' : ''}J/17`, ['s17_1_1_ms', 's17_1_1_qp'])
      dsTest(`0610/01/M${withExtraSlash ? '/' : ''}J/16`, ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(`0610/10/M${withExtraSlash ? '/' : ''}J/16`, ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(`0610/11/M${withExtraSlash ? '/' : ''}J/16`, ['s16_1_0_ms', 's16_1_0_qp'])
      dsTest(`0610/11/O${withExtraSlash ? '/' : ''}N/16`, ['w16_1_1_qp', 'w16_1_1_ms'])
      dsTest(`0610/10/O${withExtraSlash ? '/' : ''}N/16`, [])
      dsTest(`0610/01/O${withExtraSlash ? '/' : ''}N/16`, [])
    })

    it('Overflow result', function (done) {
      supertest(schsrch)
        .get('/search/?query=0611&as=json')
        .set('Host', 'schsrch.xyz')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => res.body.should.be.an.Object())
        .expect(res => res.body.response.should.equal('overflow', 'Response should be "overflow" type'))
        .expect(res => should.not.exist(res.body.list))
        .end(done)
    })
    function overflowEmpty (query) {
      it(`Overflow when empty query (${JSON.stringify(query)})`, function (done) {
        supertest(schsrch)
          .get(`/search/?query=${encodeURIComponent(query)}&as=json`)
          .set('Host', 'schsrch.xyz')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(res => res.body.should.be.an.Object())
          .expect(res => res.body.response.should.equal('overflow', 'Response should be "overflow" type'))
          .expect(res => should.not.exist(res.body.list))
          .end(done)
      })
    }
    overflowEmpty('')
    overflowEmpty(' ')
    it('Unknow format', function (done) {
      supertest(schsrch)
        .get('/search/?query=0610 s17 ms 1&as=lol')
        .set('Host', 'schsrch.xyz')
        .expect(404)
        .expect(res => res.text.should.match(/format unknow/i))
        .end(done)
    })

    it('should have typeFilter value when there is a type filter', function (done) {
      supertest(schsrch)
        .get('/search/?query=' + encodeURIComponent('0610 s16 ms'))
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect(res => should.equal(res.body.typeFilter, 'ms'))
        .end(done)
    })
    it('should have typeFilter value when there is a type filter', function (done) {
      supertest(schsrch)
        .get('/search/?query=' + encodeURIComponent('0610_s17_qp_1.pdf'))
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect(res => should.equal(res.body.typeFilter, 'qp'))
        .end(done)
    })
    it('should return null for typeFilter when there is no type filter', function (done) {
      supertest(schsrch)
        .get('/search/?query=' + encodeURIComponent('0610 s17 1'))
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect(res => should.equal(res.body.typeFilter, null))
        .end(done)
    })
  })
