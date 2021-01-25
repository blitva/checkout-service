const chai = require('chai'), chaiHttp = require('chai-http'), { expect } = require('chai');
const app = require('../server/index.js');

chai.use(chaiHttp);
chai.should();

describe('API calls', () => {

    let requester;

    before(async () => {
      requester = await chai.request(app).keepOpen();
    });

    describe('Single product API call - GET /priceandinventory/id/:productId', () => {
      // valid ids are 1000-1099
      const id = 1000;
      const invalidId = 100;

      it('should get a product\'s price and inventory count', (done) => {
        requester.get(`/priceandinventory/id/${id}`)
          .end((err, res) => {
            let parsedResponse = JSON.parse(res.text);
            res.should.have.status(200);
            res.body.should.be.a('array');
            expect(res.body[0].id).to.equal(1000);
            expect(res.body[0]).to.have.property('price');
            expect(res.body[0]).to.have.property('inventory');
            done();
          });
      });

      it('should respond with a 400 status code when requesting an invalid product id', (done) => {
        requester.get(`/priceandinventory/id/${invalidId}`)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });

    describe('Multiple products API call - POST /priceandinventory/id/multiple', () => {
      // valid ids are 1000-1099
      const ids = [1000, 1005, 1010, 1085];

      it('should get multiple products\' prices and inventory counts', (done) => {
        requester.post('/priceandinventory/id/multiple')
          .send(ids)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            expect(res.body).to.have.length(4);
            expect(res.body[0].id).to.equal(1000);
            expect(res.body[0]).to.have.property('price');
            expect(res.body[0]).to.have.property('inventory');
            done();
          });
      });

      it('should respond with a 404 status code when requesting too many products', (done) => {
        let requestLimit = 30;
        let tooManyProductIds = [];
        // push 31 valid ids into an array to send with the request
        for (let i = 0; i <= requestLimit; i++) {
          tooManyProductIds.push(i + 1000);
        };

        requester.post('/priceandinventory/id/multiple')
          .send(tooManyProductIds)
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
    });

    after(async () => {
      await requester.close();
    });
});


