import React from "react";
import Nav from "../components/nav";
import Footer from "../components/footer";

const Layout = ({
  children,
  lang,
  setLang,
}: {
  children: React.ReactNode;
  lang: "vi" | "en";
  setLang: (lang: "vi" | "en") => void;
}) => {

  const childrenWithLang = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<any>, { lang })
      : child
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Nav onLangChange={setLang} lang={lang} />
      <main className="flex-1">{childrenWithLang}</main>
      <Footer lang={lang} />
    </div>
  );
};

export default Layout;