import React, { FunctionComponent, ReactElement } from 'react';
import {
  Header,
  Logo,
  PageTitle,
  TabList,
  TabListItem,
  Link,
  ExternalLink,
} from 'mark-one';
import { useLocation } from 'react-router-dom';
import logo from 'client/img/seas-logo.svg';
import { HeaderFlex } from 'client/components/general';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useGroupGuard } from '../../hooks/useGroupGuard';

/**
 * The header bar that appears at the top of every pages, along with the
 * navigation tabs beneath it.
 */

const AppHeader:FunctionComponent = () => {
  /**
   * Check the user's permission level for accessing the different app resources
   */
  const {
    isLoggedIn,
    isReadOnly,
    isAdmin,
  } = useGroupGuard();

  /**
   * Ordered list of the navigation tabs to display under the header.
   */
  const tabs: { link: string; text: string, isVisible: boolean }[] = [
    { link: '/courses', text: 'Courses', isVisible: isReadOnly },
    // @TODO: Restore when non-class-meetings are done
    { link: '/non-class-meetings', text: 'Non class meetings', isVisible: false },
    { link: '/faculty', text: 'Faculty', isVisible: isReadOnly },
    { link: '/four-year-plan', text: '4 Year Plan', isVisible: true },
    { link: '/schedule', text: 'Schedule', isVisible: true },
    { link: '/course-admin', text: 'Course Admin', isVisible: isAdmin },
    { link: '/faculty-admin', text: 'Faculty Admin', isVisible: isAdmin },
  ];

  /**
   * Get the current url path to determine which tab should be active
   */
  const { pathname: currentPath } = useLocation();

  return (
    <>
      <Header justify="space-between">
        <HeaderFlex>
          <Logo href="/" image={logo}>SEAS Logo</Logo>
          <PageTitle>Course Planning</PageTitle>
        </HeaderFlex>
        <HeaderFlex>
          { isLoggedIn && (
            <ExternalLink title="Log Out" href={`${process.env.SERVER_URL}/logout`}>
              <>
                Log Out
                {' '}
                <FontAwesomeIcon icon={faSignOutAlt} />
              </>
            </ExternalLink>
          )}
        </HeaderFlex>
      </Header>
      <nav>
        <TabList>
          {tabs
            .filter(({ isVisible }) => isVisible)
            .map((tab): ReactElement => (
              <TabListItem
                isActive={currentPath === tab.link}
                key={tab.text}
              >
                <Link to={tab.link}>
                  {tab.text}
                </Link>
              </TabListItem>
            ))}
        </TabList>
      </nav>
    </>
  );
};

export default AppHeader;
