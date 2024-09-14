const Plans = () => {
    return (
        <section className="bg-gray-900 py-12 h-screen rounded-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                        ZoiDrive 定价计划
                    </h2>
                    <p className="mt-4 text-xl text-gray-400">
                        简单、透明的定价，满足您的业务需求。
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Free Plan */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white">
                                免费方案
                            </h3>
                            <p className="mt-4 text-gray-400">
                                开始使用我们的基本功能。
                            </p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-white">
                                ￥0
                            </span>
                            <span className="text-xl font-medium text-gray-400">
                                /月
                            </span>
                        </div>
                        <ul className="mb-8 space-y-4 text-gray-400">
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>免费使用</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>100 GB 存储空间</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>在线图片查看</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>每月 10 次磁力下载配额</span>
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="block w-full py-3 px-6 text-center rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            立即使用
                        </a>
                    </div>

                    {/* Starter Plan */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white">
                                入门方案
                            </h3>
                            <p className="mt-4 text-gray-400">
                                适合个人日常存储使用
                            </p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-white">
                                ￥30
                            </span>
                            <span className="text-xl font-medium text-gray-400">
                                /月
                            </span>
                        </div>
                        <ul className="mb-8 space-y-4 text-gray-400">
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>超高速下载</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>1000 GB 存储空间</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>在线图片、视频查看</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>每月 100 次磁力下载配额</span>
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="block w-full py-3 px-6 text-center rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            选择方案
                        </a>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white">
                                专业计划
                            </h3>
                            <p className="mt-4 text-gray-400">
                                为高需求人群定制
                            </p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-white">
                                ￥88
                            </span>
                            <span className="text-xl font-medium text-gray-400">
                                /月
                            </span>
                        </div>
                        <ul className="mb-8 space-y-4 text-gray-400">
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>无限制下载速度</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>2 TB 存储空间</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>在线图片、视频查看与文档编辑</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>无限次下载配额</span>
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="block w-full py-3 px-6 text-center rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            选择方案
                        </a>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white">
                                企业级计划
                            </h3>
                            <p className="mt-4 text-gray-400">
                                最优质的服务
                            </p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-white">
                                ￥4999
                            </span>
                            <span className="text-xl font-medium text-gray-400">
                                /月
                            </span>
                        </div>
                        <ul className="mb-8 space-y-4 text-gray-400">
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>专属存储服务器，专线接入</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>12 TB 独立存储空间</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>可自定义服务</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-green-500 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>专人对接</span>
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="block w-full py-3 px-6 text-center rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            联系我们
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Plans; // 导出组件
