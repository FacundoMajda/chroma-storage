import { ChromaClient, CohereEmbeddingFunction } from "chromadb";

const client = new ChromaClient();

const embedder = new CohereEmbeddingFunction({
  cohere_api_key: "YOUR_COHERE_API_KEY",
  model: "embed-multilingual-v2.0",
  batchSize: 48,
  verbose: true,
});

const getCollectionList = async () => {
  try {
    const res = await client.listCollections();
    return res;
  } catch (error) {
    console.error("Error al obtener la lista de colecciones:", error);
    throw error;
  }
};

const checkIfCollectionExists = async (name) => {
  try {
    const collections = await getCollectionList();
    return collections.some((collection) => collection.name === name);
  } catch (error) {
    console.error("Error al verificar la colección:", error);
    throw error;
  }
};

const createCollection = async (name) => {
  try {
    const exists = await checkIfCollectionExists(name);
    if (exists) {
      throw new Error(`La colección "${name}" ya existe.`);
    }

    const newCollection = await client.createCollection({
      name,
      embeddingFunction: embedder,
    });

    return newCollection;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al crear la colección:", error.message);
    } else {
      console.error("Error al crear la colección:", error);
    }
    throw error;
  }
};

const getCollection = async (name) => {
  try {
    const selectedCollection = await client.getCollection({
      name,
      embeddingFunction: embedder,
    });
    return selectedCollection;
  } catch (error) {
    console.error("Error al obtener la colección:", error);
    throw error;
  }
};

const generateEmbeddings = async (documents) => {
  try {
    const embeddings = await embedder.generate(documents);
    return embeddings;
  } catch (error) {
    throw error;
  }
};

const addDocumentsToCollection = async (
  collectionName,
  ids,
  metadatas,
  documents
) => {
  try {
    console.log("Preparando datos para añadir a la colección...");
    const data = {
      ids,
      documents,
    };

    if (metadatas) {
      data.metadatas = metadatas;
    }

    console.log("Datos preparados:", data);

    const collection = await getCollection(collectionName);

    console.log("Añadiendo documentos a la colección: ", collectionName);
    await collection.add(data);

    console.log("Documentos añadidos correctamente a la colección.");
  } catch (error) {
    if (error.message.includes("too large to embed")) {
      console.error(
        "Error: Los documentos son demasiado grandes para ser embebidos con la función de embedding seleccionada."
      );
    } else {
      console.error("Error al añadir documentos a la colección:", error);
    }
    throw error;
  }
};

(async () => {
  try {
    const ids = ["id1", "id2", "id3"];
    const metadatas = [
      { chapter: "3", verse: "16" },
      { chapter: "3", verse: "5" },
      { chapter: "29", verse: "11" },
    ];
    const documents = ["lorem ipsum...", "doc2", "doc3"];

    console.log("Iniciando proceso de adición de documentos...");
    await addDocumentsToCollection("test", ids, metadatas, documents);
    console.log("Proceso completado.");
  } catch (error) {
    console.error("Error:", error);
  }
})();
