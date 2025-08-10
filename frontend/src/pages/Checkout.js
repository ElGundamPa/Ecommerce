import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { orderService, utilService } from '../services/api';
import { z } from 'zod';
import { useForm, FormProvider, FormField } from '../components/ui/Form';
import { Label, Input, Textarea, Button, Card, CardContent } from '../components/ui';
import { useToast } from '../components/ui/Toast';

const schema = z.object({
  customerName: z.string().min(1, 'El nombre es requerido'),
  customerEmail: z.string().email('El email no es válido'),
  customerAddress: z.string().min(1, 'La dirección es requerida'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { show } = useToast();

  const methods = useForm({ schema, defaultValues: { customerName: '', customerEmail: '', customerAddress: '' } });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  // Si no hay productos en el carrito, redirigir
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (data) => {
    try {
      const orderItems = items.map(item => ({ product: item._id, quantity: item.quantity }));
      const orderPayload = { ...data, items: orderItems, total };
      const response = await orderService.create(orderPayload);

      show({ title: '¡Pedido exitoso!', description: `N° ${response.data.orderNumber}` });

      setTimeout(() => {
        clearCart();
        navigate('/confirmation', { state: { orderData: response.data } });
      }, 1000);
    } catch (error) {
      show({ title: 'Error', description: 'No se pudo procesar el pedido', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💳 Checkout</h1>
        <p className="text-muted-foreground">Completa tu información para finalizar la compra</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Información de contacto</h2>

            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <FormField name="customerName" label="Nombre completo" required error={errors.customerName?.message}>
                <Input placeholder="Tu nombre completo" invalid={!!errors.customerName} {...register('customerName')} />
              </FormField>

              <FormField name="customerEmail" label="Email" required error={errors.customerEmail?.message}>
                <Input type="email" placeholder="tu@email.com" invalid={!!errors.customerEmail} {...register('customerEmail')} />
              </FormField>

              <FormField name="customerAddress" label="Dirección de envío" required error={errors.customerAddress?.message}>
                <Textarea rows={3} placeholder="Calle, número, ciudad, código postal" invalid={!!errors.customerAddress} {...register('customerAddress')} />
              </FormField>

              <Button type="submit" className="w-full" loading={isSubmitting}>
                <CreditCard className="h-4 w-4 mr-2" />
                Finalizar compra
              </Button>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Resumen del pedido */}
        <Card className="sticky top-24 h-fit">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=Imagen';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {utilService.formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{utilService.formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío:</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{utilService.formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
