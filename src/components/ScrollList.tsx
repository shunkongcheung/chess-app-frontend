import styled from "styled-components";

interface IProps {
  columns?: number;
  listItems: Array<React.ReactNode>;
}

const Container = styled.div<{ columns: number }>`
  width: 100%;
  display: grid;
  flex-wrap: wrap;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  gap: 20px;
  height: 100%;
  overflow-y: auto;
`;

const ScrollList = ({ columns = 1, listItems }: IProps) => (
  <Container columns={columns}>{listItems}</Container>
);

export default ScrollList;
