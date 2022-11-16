import styled from "styled-components";

interface IProps {
  children: React.ReactNode;
  descriptions?: Array<{ title: React.ReactNode; value: React.ReactNode }>;
}

const Container = styled.div`
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19);
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Title = styled.div`
  font-weight: bold;
`;

const Value = styled.div``;

const Desc = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const Card = ({ children, descriptions }: IProps) => (
  <Container>
    {children}
    {(descriptions || []).map(({ title, value }, index) => (
      <Desc key={`Desc-${index}`}>
        <Title>{title}</Title>
        <Value>{value}</Value>
      </Desc>
    ))}
  </Container>
);

export default Card;
