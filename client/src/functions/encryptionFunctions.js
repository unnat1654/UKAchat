export const getRoomSharedKey = (room) => {
  const userKeysObject = JSON.parse(localStorage.getItem(`userKeys`));
  return userKeysObject[room].sharedKey;
};

export const saveUserRoomKey = (room, userPrivateKey, contactPublicKey) => {
  const userKeysObject = JSON.parse(localStorage.getItem(`userKeys`));
  userKeysObject[room] = {
    privateKey: userPrivateKey,
    ...(contactPublicKey && {
      sharedKey: deriveSharedkey(userPrivateKey, contactPublicKey),
    }),
  };
  localStorage.setItem(`userKeys`, JSON.stringify(userKeysObject));
  return thisRoomKeyPair.publicKey;
};

export const generateKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    ["deriveKey"]
  );
};

export const deriveSharedkey = (privateKey, publicKey) => {
  return window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encrypt = async (secretKey, message) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(message);

  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    secretKey,
    encodedMessage
  );
  return { cipherText, iv };
};

export const decrypt = async (secretKey, iv, cipherText) => {
  const encodedMessage = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    secretKey,
    cipherText
  );
  return new TextDecoder().decode(encodedMessage);
};
