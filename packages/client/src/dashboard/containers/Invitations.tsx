import { Navbar } from "./Navbar.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";

export const Invitations = () => {

  return <ScreenContainer>
    <Navbar />

    <div className="container">
      <div className="row">
        <div className="col-12">

          <div className="mt-5">
            <h4>Invitations</h4>
          </div>

        </div>
      </div>
    </div>
    <Footer/>
  </ScreenContainer>;
};