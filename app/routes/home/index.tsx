export default function HomeIndex() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          alt="Thank you for connecting"
          src="https://t4.ftcdn.net/jpg/03/29/44/25/360_F_329442520_bs9DE1vhchdtXtbsJXcwGQTpjZd5NzDo.jpg"
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold">
            Thank you for Connecting your Account!
          </h1>
          <p className="py-6">
            Admin will be able to create pages for these users now.
          </p>
        </div>
      </div>
    </div>
  );
}
