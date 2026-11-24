'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(id, name, price, qty, hsn, gstRate) {
  return { id, name, sku: `SKU-${id}`, price, qty, hsn, gstRate };
}

function order(id, items, coupon) {
  return { id, items, coupon };
}

test('CURRENT BEHAVIOUR: #1001 no coupon, 5% and 12% item GST', function () {
  const items = [
    line(1, 'Rice', 640, 1, '1006', 5),
    line(7, 'Butter', 260, 1, '0405', 12)
  ];
  const actualInvoice = invoice.computeInvoiceFigures(order(1001, items, ''));
  const actualCheckout = pricing.computeTotals(items, '');

  assert.deepEqual(actualInvoice, {
    subtotal: 900,
    discount: 0,
    tax: 63.2,
    cgst: 31.6,
    sgst: 31.6,
    total: 963.2,
    rows: [
      { name: 'Rice', sku: 'SKU-1', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'Butter', sku: 'SKU-7', hsn: '0405', qty: 1, price: 260, gstPercent: 12, line: 260, lineTax: 31.2 }
    ]
  });
  assert.deepEqual(
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total },
    { subtotal: 900, discount: 0, tax: 63.2, total: 963.2 }
  );
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 discount is applied before GST', function () {
  const items = [
    line(1, 'Rice', 640, 1, '1006', 5),
    line(4, 'Sunflower Oil', 190, 2, '1512', 5)
  ];
  const actualInvoice = invoice.computeInvoiceFigures(order(1002, items, 'SAVE10'));
  const actualCheckout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: actualInvoice.subtotal, discount: actualInvoice.discount, tax: actualInvoice.tax, total: actualInvoice.total },
    { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  );
  assert.deepEqual(
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total },
    { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 honors the ₹150 cap before GST', function () {
  const items = [line(5, 'Groundnut Oil', 1120, 2, '1508', 5)];
  const actualInvoice = invoice.computeInvoiceFigures(order(1004, items, 'SAVE10'));
  const actualCheckout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: actualInvoice.subtotal, discount: actualInvoice.discount, tax: actualInvoice.tax, total: actualInvoice.total },
    { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  );
  assert.deepEqual(
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total },
    { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 no coupon, all items at 18% GST', function () {
  const items = [
    line(8, 'Packaged Tea', 140, 1, '0902', 18),
    line(12, 'Kokum Concentrate', 180, 2, '2106', 18)
  ];
  const actualInvoice = invoice.computeInvoiceFigures(order(1008, items, ''));
  const actualCheckout = pricing.computeTotals(items, '');

  assert.deepEqual(
    { subtotal: actualInvoice.subtotal, discount: actualInvoice.discount, tax: actualInvoice.tax, cgst: actualInvoice.cgst, sgst: actualInvoice.sgst, total: actualInvoice.total },
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  );
  assert.deepEqual(
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total },
    { subtotal: 500, discount: 0, tax: 90, total: 590 }
  );
});

test('CURRENT BEHAVIOUR: invoice matches checkout on mixed slabs and capped SAVE10', function () {
  const items = [
    line(5, 'Groundnut Oil', 1120, 2, '1508', 5),
    line(7, 'Butter', 260, 1, '0405', 12)
  ];
  const actualInvoice = invoice.computeInvoiceFigures(order(1004, items, 'SAVE10'));
  const actualCheckout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total },
    { subtotal: 2500, discount: 150, tax: 134.61, total: 2484.61 }
  );
  assert.deepEqual(
    { subtotal: actualInvoice.subtotal, discount: actualInvoice.discount, tax: actualInvoice.tax, total: actualInvoice.total },
    { subtotal: actualCheckout.subtotal, discount: actualCheckout.discount, tax: actualCheckout.tax, total: actualCheckout.total }
  );
  assert.deepEqual(
    actualInvoice.rows.map(function (row) { return { gstPercent: row.gstPercent, lineTax: row.lineTax }; }),
    actualCheckout.lines.map(function (lineItem) { return { gstPercent: lineItem.gstPercent, lineTax: lineItem.tax }; })
  );
});
