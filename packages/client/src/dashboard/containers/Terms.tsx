import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { Link } from "react-router-dom";

export const Terms = () => {
  return <ScreenContainer>

    <div className="container">
      <div className="row">
        <div className="col-12">

          <div className="mt-5">
            <Link to="/">Go to home</Link>
          </div>

          <div className="mt-3">
            <h4>Terms of Service</h4>
          </div>

          <div>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias aliquid atque cupiditate esse ipsum maiores omnis sapiente suscipit unde veritatis vero, voluptate, voluptatem! Accusamus eum facilis voluptate! Accusantium aut autem consectetur corporis, deleniti dolor dolore, expedita explicabo illo illum in laborum magnam magni nam nemo nesciunt nisi nulla obcaecati officia quae ratione repudiandae sed sequi vero voluptatum. Culpa delectus doloribus enim ipsa, laboriosam libero nisi non odit sequi. Ab accusamus accusantium architecto atque blanditiis dicta eaque earum eius eligendi, illum iusto labore magnam minima natus nihil non placeat quam quasi quibusdam quisquam quo reiciendis rerum soluta sunt totam vero voluptatum.
          </div>

        </div>
      </div>
    </div>
  </ScreenContainer>;
};