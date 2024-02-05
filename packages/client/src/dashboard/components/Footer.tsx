export const Footer = () => {
  const year = new Date().getFullYear();

  return <footer className="footer mt-auto">
    <div className="mt-5 bg-light-subtle border-top">
      <div className="container text-center py-3">
        <div className="row">
          <div className="col-12 small">

            <div className="justify-content-between d-none d-md-flex">
              <div className="d-flex gap-4">
                <div className="text-muted text-decoration-none">
                  &copy; {year} App Name
                </div>
                <a
                  href="/privacy"
                  className="text-muted text-decoration-none"
                  target="_blank"
                >Privacy Policy</a>
                <a
                  href="/terms"
                  className="text-muted text-decoration-none"
                  target="_blank"
                >Terms of Use</a>
              </div>
              <div className="d-flex gap-4">
                <a
                  href="/"
                  className="text-muted text-decoration-none"
                  target="_blank"
                >Home</a>
                <a
                  href="/docs"
                  className="text-muted text-decoration-none"
                  target="_blank"
                >Docs</a>
                <a
                  href="https://github.com/"
                  className="text-muted text-decoration-none"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="ri-github-fill"></span>
                  GitHub
                </a>
              </div>
            </div>

            <div className='d-block d-md-none justify-content-between'>
              <div className="text-muted text-decoration-none text-center">
                &copy; {year} App Name
              </div>
            </div>

            <div className="d-flex d-md-none justify-content-between mt-1">
              <a
                href="/privacy"
                className="text-muted text-decoration-none"
                target="_blank"
              >Privacy Policy</a>
              <a
                href="/terms"
                className="text-muted text-decoration-none"
                target="_blank"
              >Terms of Use</a>
              <a
                href="/"
                className="text-muted text-decoration-none"
                target="_blank"
              >Home</a>
              <a
                href="/docs"
                className="text-muted text-decoration-none"
                target="_blank"
              >Docs</a>
              <a
                href="#"
                className="text-muted text-decoration-none"
                target="_blank"
              >
                <span className="ri-github-fill"></span>
                GitHub
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  </footer>;
};