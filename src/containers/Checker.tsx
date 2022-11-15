import React from "react";
import { Node } from "../types";

interface IProps {
  node: Node;
}

const Checker = ({ node }: IProps) => {
  console.log(node);
  return <>hihi</>;
}

export default Checker
