var PROTO_PATH = __dirname + '/../proto/manipulate.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var manipulate_proto = grpc.loadPackageDefinition(packageDefinition).manipulate;

function main() {
    target = 'localhost:50051';
    var client = new manipulate_proto.Manipulate(target, grpc.credentials.createInsecure());

    var user = "world";
    client.manipulateService({username: user}, function(err, response) {
        console.log('Greeting:', response.base64);
    });
}

main();