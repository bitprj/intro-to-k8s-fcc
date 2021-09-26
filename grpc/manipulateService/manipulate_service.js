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

/**
 * Implements the SayHello RPC method.
 */
function manipulateService(call, callback) {
    callback(null, {base64: 'Hello ' + call.request.username});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  console.log("Manipulate Service running on Port 50051")
  server.addService(manipulate_proto.Manipulate.service, {manipulateService: manipulateService});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
