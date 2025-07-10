import Header from "../components/header";

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="h-screen p-3">{children}</main>
    </>
  );
};
