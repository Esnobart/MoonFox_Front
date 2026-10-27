import api from "../../redux/api.js";

export async function updateProduct(productId, values, { signal, version } = {}) {
  const newImages = [];
  const images = values.images.map((image) => {
    if (image.file) {
      const fileIndex = newImages.push(image.file) - 1;
      return { fileIndex };
    }

    return { url: image.url };
  });
  const body = new FormData();

  body.append(
    "data",
    JSON.stringify({
      version,
      name: values.name.trim(),
      description: values.description.trim(),
      collectionName: values.collectionName,
      author: values.author,
      price: values.price,
      inStock: values.inStock,
      popular: values.popular,
      ageRestriction: values.ageRestriction,
      images,
    }),
  );
  newImages.forEach((file) => body.append("newImages", file, file.name));

  // Let the browser set Content-Type, including the multipart boundary.
  const response = await api.patch(
    `products/${encodeURIComponent(productId)}`,
    body,
    { signal },
  );

  return response.data;
}
