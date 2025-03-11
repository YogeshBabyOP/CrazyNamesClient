import { CRAZY_NAMES } from "@/constants";

const Crazy = () => {
  return (
    <>
      <div className="items-center justify-items-center">
        <h1>Crazy Names</h1>
        <ul>
          {CRAZY_NAMES.map((crazy) => (
            <li key={crazy.id}>{crazy.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Crazy;
