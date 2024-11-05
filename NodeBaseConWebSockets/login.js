 document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita el envío del formulario por defecto

    // Obtén los valores del formulario
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;

    // Envía los datos al servidor usando fetch
    try {
      const response = await fetch("http://localhost:3000/login", { // Cambia la URL según la configuración de tu servidor
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }) // Enviar como JSON
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("Inicio de sesión exitoso");
          // Redirige a otra página o realiza alguna acción en caso de éxito
          window.location.href = "/home"; // Cambia "/home" a la ruta que prefieras
        } else {
          alert("Usuario o contraseña incorrectos");
        }
      } else {
        alert("Error al conectar con el servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al intentar iniciar sesión");
    }
  });

