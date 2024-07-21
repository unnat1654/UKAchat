export const getRoomSharedKey = (room) => {
  const userKeysObject = JSON.parse(localStorage.getItem(`userKeys`));
  return userKeysObject[room].sharedKey;
};

export const saveUserRoomKey = async (
  room,
  userPrivateKey,
  contactPublicKey
) => {
  let sharedKey;
  if (contactPublicKey) {
    sharedKey = await deriveSharedkey(userPrivateKey, contactPublicKey);
  }
  const userKeysObject = localStorage.getItem(`userKeys`)
    ? JSON.parse(localStorage.getItem(`userKeys`))
    : {};
  userKeysObject[room] = {
    privateKey: userPrivateKey,
    ...(contactPublicKey && { sharedKey }),
  };
  localStorage.setItem(`userKeys`, JSON.stringify(userKeysObject));
};

export const generateKeyPair = async () => {
  try {
    const generatedKey = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey"]
    );
    const publicKey = await window.crypto.subtle.exportKey(
      "jwk",
      generatedKey.publicKey
    );
    const privateKey = await window.crypto.subtle.exportKey(
      "jwk",
      generatedKey.privateKey
    );

    return {
      publicKey: `${publicKey.x},${publicKey.y}`,
      privateKey: `${privateKey.x},${privateKey.y},${privateKey.d}`,
    };
  } catch (error) {
    console.log(error);
  }
};

const importPublicKey = async (publicKeyJWK) => {
  try {
    return await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJWK,
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      []
    );
  } catch (error) {
    console.log(error);
  }
};
const importPrivateKey = async (privateKeyJWK) => {
  try {
    return await window.crypto.subtle.importKey(
      "jwk",
      privateKeyJWK,
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey"]
    );
  } catch (error) {
    console.log(error);
  }
};

export const deriveSharedkey = async (privateKeyXYD, publicKeyXY) => {
  try {
    const [theirX, theirY] = publicKeyXY.split(",");
    const [myX, myY, myD] = privateKeyXYD.split(",");
    const publicKeyJWK = {
      crv: "P-384",
      ext: true,
      key_ops: [],
      kty: "EC",
      x: theirX,
      y: theirY,
    };
    const privateKeyJWK = {
      kty: "EC",
      crv: "P-384",
      d: myD,
      ext: true,
      key_ops: ["deriveKey"],
      x: myX,
      y: myY,
    };

    const publicKey = await importPublicKey(publicKeyJWK);

    const privateKey = await importPrivateKey(privateKeyJWK);

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicKey,
      },
      privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // Set to true for exportable keys
      ["encrypt", "decrypt"]
    );

    // Export the derived key to a raw format
    const rawKey = await window.crypto.subtle.exportKey("raw", derivedKey);

    // Convert the raw key to a base64 string
    return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
  } catch (error) {
    console.error("Error deriving shared key:", error);
  }
};

export const encrypt = async (secretKey, message) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encodedMessage = new TextEncoder().encode(message);

  const rawKey = Uint8Array.from(atob(secretKey), (c) =>
    c.charCodeAt(0)
  ).buffer;

  const sharedKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey,
    encodedMessage
  );
  return {
    cipherText: btoa(String.fromCharCode(...new Uint8Array(cipherText))),
    iv: btoa(String.fromCharCode(...iv)),
  };
};

export const decrypt = async (secretKey, iv, cipherText) => {
  const rawKey = Uint8Array.from(atob(secretKey), (c) =>
    c.charCodeAt(0)
  ).buffer;
  const sharedKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
  const decodedIv = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const decodedCipherText = Uint8Array.from(atob(cipherText), (c) =>
    c.charCodeAt(0)
  ).buffer;

  const encodedMessage = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: decodedIv,
    },
    sharedKey,
    decodedCipherText
  );
  return new TextDecoder().decode(encodedMessage);
};
