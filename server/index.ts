import express from 'express';
import { getServer, getClient, ServerTypes } from "r4bbit";

const app = express();

// const fibonacciSchema = z.object({
//   n: z.string(),
// // });

// type FibonacciSchema = z.infer<typeof fibonacciSchema>;

const fibonacci = (n: number): number => {
  if (n < 2) {
    return 1;
  }

  return fibonacci(n - 2) + fibonacci(n - 1);
};

getServer("amqp://guest:guest@localhost:5672/", {
  connectOptions: {
    reconnectTimeInSeconds: 1
  }
}).then((server) => {
  server.registerRPCRoute(
    {
      queueName: 'fibonacci-server',
      exchangeName: 'r4bbit-express',
      routingKey: 'fibonacci.topic',
    },
    (reply: ServerTypes.Reply) => (msg: Record<string, unknown> | string) => {
      console.log('message received', msg);
      reply(String(fibonacci(Number((msg as unknown as {content: {n: number}}).content.n))));
    },
  );
});

app.listen(3001, () => {
  console.log('Server started on port 3000');
});