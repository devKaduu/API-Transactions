import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("Transactions Rotues", () => {
  // Executar uma unica vez antes de todos os testes
  beforeAll(async () => {
    await app.ready();
  });

  // Executar uma unica vez depois de todos os testes
  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a new transactiom", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "Transação de teste",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    // Preciso criar uma transação antes de listar
    const createTransactionResponse = await request(app.server).post("/transactions").send({
      title: "Transação de teste",
      amount: 5000,
      type: "credit",
    });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionResponse = await request(app.server).get("/transactions").set("Cookie", cookies!).expect(200);

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Transação de teste",
        amount: "5000",
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server).post("/transactions").send({
      title: "Transação de Teste",
      amount: 5000,
      type: "credit",
    });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionResponse = await request(app.server).get("/transactions").set("Cookie", cookies!).expect(200);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies!)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "Transação de Teste",
        amount: "5000",
      }),
    );
  });

  it("should be able to get the summary", async () => {
    //Create
    const createTransactionResponse = await request(app.server).post("/transactions").send({
      title: "Transação de Credito",
      amount: 5000,
      type: "credit",
    });

    //Get cookies
    const cookies = createTransactionResponse.get("Set-Cookie");

    //Create
    await request(app.server).post("/transactions").set("Cookie", cookies!).send({
      title: "Transação de Debito",
      amount: 2000,
      type: "debit",
    });

    //Get the summary
    const summaryResponse = await request(app.server).get(`/transactions/summary`).set("Cookie", cookies!).expect(200);

    expect(summaryResponse.body.summary).toEqual({
      _sum: {
        amount: "3000",
      },
    });
  });
});
