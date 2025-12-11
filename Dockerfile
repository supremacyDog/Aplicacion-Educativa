# Usa la versión 20.18.0 de Node.js como base
FROM node:20.18.0

# Crea el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias y los instala
COPY package*.json ./
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Expone el puerto donde corre la app
EXPOSE 3000

# Comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]
