import useUserStore from '@/store/UserStore';
import TwoFactorBind from '@/components/two_factor/TwoFactorBind';

const notOpenTwoFactor = () => {
    return (
        <>
            <div className='flex justify-center items-center mt-10'>
                <span className='text-2xl font-bold'>请先开启两步验证后再使用保险箱功能</span>
            </div>

            <div className='flex justify-center items-center mt-10'>
                <TwoFactorBind />
            </div>
        </>
    );

};


const SafesContent = () => {

    const { userInfo } = useUserStore();

    if (!userInfo.userSetting?.twoFactorStatus) {
        return notOpenTwoFactor();
    } 

    return (
        <div>
            <h1>保险箱</h1>
        </div>
    );
    

};


export default SafesContent;