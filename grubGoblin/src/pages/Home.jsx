import useCurrentMenu from "../hooks/useCurrentMenu";
import useMeals from "../hooks/useMeals";
import MenuDisplay from "../components/MenuDisplay";

function Home() {
  const menu = useCurrentMenu();

  if (!menu) return <div>Loading menu...</div>;

  return (
    <div>
      <h1>Today’s Menu</h1>
      <MenuDisplay mealType="breakfast" mealIds={menu.breakfast} />
      <MenuDisplay mealType="lunch" mealIds={menu.lunch} />
      <MenuDisplay mealType="dinner" mealIds={menu.dinner} />
    </div>
  );
}

export default Home;