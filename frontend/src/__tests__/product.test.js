/* eslint-disable */
import React, { useState as useStateMock } from "react";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  waitForElement,
  findByTestId,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Product } from "../pages/Product";
import axios from "axios";
import { setupServer } from 'msw/node';
import { rest } from 'msw';


jest.mock("axios");

// afterEach(cleanup);

const server = setupServer(rest.get('http://localhost:5000/products', (_req, res, ctx) =>{
    return res(ctx.json([
        {
          id: 1000,
          name: "Stankonia from GET api",
          price: 20.2,
          productImage: "image1.png",
          creationDate: "21/05/2023",
          updateDate: "18/05/2023",
        },
        {
          id: 1001,
          name: "Rakim  from GET api",
          price: 15.2,
          productImage: "image2.png",
          creationDate: "22/05/2023",
          updateDate: "15/05/2023",
        },
        {
          id: 1002,
          name: "Rakim15 from GET api",
          price: 10.2,
          productImage: "image3.png",
          creationDate: "20/05/2023",
          updateDate: "17/05/2023",
        },
        {
          id: 1003,
          name: "Bone Thugs N Harmony from GET api",
          price: 14.4,
          productImage: "image4.png",
          creationDate: "21/05/2023",
          updateDate: "21/05/2023",
        }]));
}))

describe("ProductList", () => {

    beforeAll(() =>{
        server.listen();
    });

    beforeEach(() =>{
        axios.get.mockClear();
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    })

  it("when isLoading is TRUE then loading text should be displayed", async () => {
    axios.get.mockResolvedValue({
      data: {
        products: [],
      },
    });

    const { debug } = render(<Product />);

    // Assertion
    await waitFor(() => {
      const logingText = screen.queryByText("loading").innerHTML;
      console.log("LOADING....", screen.queryByText("loading").innerHTML);
      expect(logingText).toBe("loading");
    });

    // console.log('COMPONENT....', debug());
  });

  it("when isLoading is FALSE and DATA is available then render data in a list", async () => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            id: 1000,
            name: "Stankonia",
            price: 20.2,
            productImage: "image1.png",
            creationDate: "21/05/2023",
            updateDate: "18/05/2023",
          },
          {
            id: 1001,
            name: "Rakim",
            price: 15.2,
            productImage: "image2.png",
            creationDate: "22/05/2023",
            updateDate: "15/05/2023",
          },
          {
            id: 1002,
            name: "Rakim15",
            price: 10.2,
            productImage: "image3.png",
            creationDate: "20/05/2023",
            updateDate: "17/05/2023",
          },
          {
            id: 1003,
            name: "Bone Thugs N Harmony",
            price: 14.4,
            productImage: "image4.png",
            creationDate: "21/05/2023",
            updateDate: "21/05/2023",
          },
        ],
      },
    });

    const { debug } = render(<Product />);

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("loading-element")
    );
    
    // console.log('COMPONENT....', debug());

    const productItems = screen
      .getAllByTestId("product-item")
      .map((cols) => cols.textContent);

    console.log("COMPONENT....", productItems); // [ 'Stankonia20.221/05/2023EditDelete' ]
    expect(productItems).toMatchInlineSnapshot(`
      Array [
        "Stankonia20.221/05/2023EditDelete",
        "Rakim15.222/05/2023EditDelete",
        "Rakim1510.220/05/2023EditDelete",
        "Bone Thugs N Harmony14.421/05/2023EditDelete",
      ]
    `);
  });

  // it("when API calls mae to GET|POST endpoint", async () =>{
  //   await axios.get.mockRestore();

  //   // await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  //   const { debug } = render(<Product />);

  //   // await waitFor(() => (screen.queryByText('loading').toBeTruthy()));

  //   await new Promise((res) => setTimeout(res, 100));

  //   await waitForElementToBeRemoved(() =>
  //     screen.queryByTestId("loading-element")
  //   //   screen.queryByText("loading").innerHTML
  //   );

  //   const productItems = screen
  //     .getAllByTestId("product-item")
  //     .map((cols) => cols.textContent);

  //   expect(productItems).toMatchInlineSnapshot();
  // })
});
