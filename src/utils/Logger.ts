export const getLogger = (name: string) => {
  return (str: string) => {
    const time = new Date().toLocaleTimeString();
    console.log(`${time}[${name}]: ${str}`);
  };
};
