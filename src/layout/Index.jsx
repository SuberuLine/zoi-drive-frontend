const Index = () => {
    return (
        <div className="flex flex-col h-screen">
            <nav className="bg-white shadow-lg">
                <div className="md:flex items-center justify-between py-2 px-8 md:px-12">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-gray-800 md:text-3xl">
                            <a href="#">MyDrive</a>
                        </div>
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="block text-gray-800 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className="hidden"
                                        d="M16.24 14.83a1 1 0 0 1-1.41 1.41L12 13.41l-2.83 2.83a1 1 0 0 1-1.41-1.41L10.59 12 7.76 9.17a1 1 0 0 1 1.41-1.41L12 10.59l2.83-2.83a1 1 0 0 1 1.41 1.41L13.41 12l2.83 2.83z"
                                    />
                                    <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row hidden md:block -mx-2">
                        <a
                            href={`/login`}
                            className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2"
                        >
                            登录
                        </a>
                        <a
                            href="#"
                            className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2"
                        >
                            联系我们
                        </a>
                    </div>
                </div>
            </nav>
            <div className="flex flex-grow bg-white">
                <div className="flex items-center text-center lg:text-left px-8 md:px-12 lg:w-1/2">
                    <div>
                        <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">
                            Build Your New{" "}
                            <span className="text-indigo-600">Data</span>
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 md:text-base">
                            打造最简单、最实用的云盘<br/>
                            √ 不收费<br/>
                            √ 不限速<br/>
                            √ 不泄露
                        </p>
                        <div className="flex justify-center lg:justify-start mt-6">
                            <a
                                className="px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800"
                                href={`/home`}
                            >
                                Get Started
                            </a>
                            <a
                                className="mx-4 px-4 py-3 bg-gray-300 text-gray-900 text-xs font-semibold rounded hover:bg-gray-400"
                                href="#"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
                <div
                    className="hidden lg:block lg:w-1/2"
                    style={{
                        clipPath: "polygon(10% 0, 100% 0%, 100% 100%, 0 100%)",
                    }}
                >
                    <div
                        className="h-full object-cover"
                        style={{
                            backgroundImage:
                                "url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80)",
                        }}
                    >
                        <div className="h-full bg-black opacity-25"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
