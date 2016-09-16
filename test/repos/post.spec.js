
var assert = require('assert');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;
var StashClient = require('../../index.js').Client;

describe('Repos (post)', function() {
    var httpClientPost, httpClient, stashClient;

    beforeEach(function() {
        stashClient = new StashClient('http://localhost/', 'username', 'password');
        httpClient = stashClient.client;
        httpClientPost = sinon.stub(httpClient, 'post');
    });

    afterEach(function() {
        httpClient.post.restore();
    });

    it('should create a new repository', function(done) {
        // Mock the HTTP Client post.
        var expected = require('../mocks/repo-single.json');
        var response = new PassThrough();
        var request = new PassThrough();
        httpClientPost.withArgs('http://localhost/projects/PRJ/repos', { data: { name: 'my-repo', public: true }, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }).callsArgWith(2, expected, response)
            .returns(request);

        // Test repos.create API.
        stashClient.repos.create('PRJ', 'my-repo', { public: true }).then(function(repo) {
            assert.equal(repo.slug, 'my-repo');
            assert.equal(repo.name, 'My repo');
            done();
        });
    });
});
