import { Money } from '../../shared/domain/money.value-object.js';
import { ProductName } from './product-name.value-object.js';
import { Product, type ProductSnapshot } from './product.entity.js';
import { Sku } from '../../shared/domain/sku.value-object.js';

function createShirt(): Product {
  return Product.create({
    sku: Sku.create('cam123-azul'),
    name: ProductName.create('Camiseta Azul'),
    price: Money.fromCents(4990),
  });
}

const storedMug: ProductSnapshot = {
  id: '019a6b7e-8c4d-7f3a-9b2e-5d1c0a4e7f61',
  sku: 'CAN001',
  name: 'Caneca Ágil',
  priceInCents: 3500,
  active: false,
};

describe('Product', () => {
  describe('create', () => {
    it('should create an active product with a new id', () => {
      const product = createShirt();

      expect(product.toSnapshot()).toEqual({
        id: expect.any(String),
        sku: 'CAM123-AZUL',
        name: 'Camiseta Azul',
        priceInCents: 4990,
        active: true,
      });
      expect(product.isActive()).toBe(true);
    });

    it('should give each product its own id', () => {
      expect(createShirt().equals(createShirt())).toBe(false);
    });
  });

  describe('restore', () => {
    it('should rebuild a product from its snapshot', () => {
      expect(Product.restore(storedMug).toSnapshot()).toEqual(storedMug);
    });

    it('should validate the stored values again', () => {
      expect(() => Product.restore({ ...storedMug, priceInCents: -1 })).toThrow(
        expect.objectContaining({ code: 'INVALID_MONEY' }),
      );
    });
  });

  describe('changes', () => {
    it('should rename the product', () => {
      const product = createShirt();

      product.rename(ProductName.create('Camiseta Azul Marinho'));

      expect(product.toSnapshot().name).toBe('Camiseta Azul Marinho');
    });

    it('should change the price', () => {
      const product = createShirt();

      product.changePrice(Money.fromCents(3990));

      expect(product.toSnapshot().priceInCents).toBe(3990);
    });
  });

  describe('activation', () => {
    it('should deactivate an active product', () => {
      const product = createShirt();

      product.deactivate();

      expect(product.isActive()).toBe(false);
    });

    it('should activate an inactive product', () => {
      const product = Product.restore(storedMug);

      product.activate();

      expect(product.isActive()).toBe(true);
    });

    it('should accept repeated activations and deactivations', () => {
      const product = createShirt();

      product.deactivate();
      product.deactivate();
      expect(product.isActive()).toBe(false);

      product.activate();
      product.activate();
      expect(product.isActive()).toBe(true);
    });
  });
});
