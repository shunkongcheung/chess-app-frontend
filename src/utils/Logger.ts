export const getLogFormatter = (name: string) => {
  return (str: string) => {
    const time = new Date().toLocaleTimeString();
    return `${time} [${name}]: ${str}`;
  };
};

export const getLogger = (name: string) => {
  const logFormatter = getLogFormatter(name);
  return (str: string) => {
    console.log(logFormatter(str));
  };
};
