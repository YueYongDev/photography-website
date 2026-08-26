import Header from "../components/header";

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen p-3">{children}</main>
    </>
  );
};
