import React from "react"
import { useNavigate } from 'react-router-dom';
import { ProfileConstants } from '../../profile/routes';

interface Props {
  successPath?: string;
}

export const RouteVerificationChallenge: React.FC<Props> = ({
  successPath = `${ProfileConstants.base}/${ProfileConstants.personalize}`,
}) => {

  const navigate = useNavigate()

  // If we are creating new keys, we must perform a second challenge. However, when using existing keys, we do not. So, we redirect to the profile
  React.useEffect(() => {
    // TODO: use "is key creation" boolean
    if (false) {
      navigate(successPath);
    }
  }, []);

  const handleChallenge = React.useMemo(() => function () {
    console.log('Do the challenge...');
    navigate(successPath);
  }, []);

  return <>
    <>Verify screen</>
    <button onClick={handleChallenge}>Handle it</button>
  </>;
}
