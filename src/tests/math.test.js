test("Debería sumar dos números correctamente", () => {
    expect(5 + 5).toBe(10);
  });

  test("Debería concatenar dos strings", () => {
    const nombre = "Juan";
    const apellido = "Perez";
    expect(`${nombre} ${apellido}`).toBe("Juan Perez");
  });

  test("El mensaje de bienvenida debería incluir 'Bienvenido'", () => {
    const mensaje = "Bienvenido al sistema";
    // .toMatch() es genial para verificar partes de un string (con texto o Regex)
    expect(mensaje).toMatch(/Bienvenido/);
  });