import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import shopify from "../shopify.server";
import {
  Page,
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
} from '@shopify/polaris';
import React from 'react';

export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);
  const response = await admin.graphql(`
    {
      products(first: 10) {
        nodes {
          id
          title
          description
        }
      }
    }
  `);

  const parsedResponse = await response.json();
  return json({
    products: parsedResponse.data.products.nodes,
  });
}

export default function ProductPage() {
  const { products } = useLoaderData();

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const rowMarkup = products.map(
    ({ id, title, description }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{description}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page title="Shopify Dashboard">
      <LegacyCard title="Products" sectioned>
        <IndexTable
          resourceName={resourceName}
          itemCount={products.length}
          selectedItemsCount={
            allResourcesSelected ? 'All' : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: 'Product Title' },
            { title: 'Description' },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  );
}
