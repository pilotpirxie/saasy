import { Navbar } from "./Navbar.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { Footer } from "../components/Footer.tsx";

export const Teams = () => {
  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />
    <Footer />
  </ScreenContainer>;
};