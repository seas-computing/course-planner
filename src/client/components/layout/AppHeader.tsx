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
import { User } from 'common/classes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

interface AppHeaderProps {
  /** The user currently logged into the app */
  currentUser: User;
}

/**
 * The header bar that appears at the top of every pages, along with the
 * navigation tabs beneath it.
 */

const AppHeader: FunctionComponent<AppHeaderProps> = ({
  currentUser,
}: AppHeaderProps): ReactElement<AppHeaderProps> => {
  /**
   * Ordered list of the navigation tabs to display under the header.
   * TODO: Need to set up conditional display of tabs based on current user
   * permission:
   * For anonymous users, only show the schedule and 4 year plan.
   * For authenticated users, include courses, faculty, and non-class meetings
   * For admin users, show the admin pages
   */
  const tabs: { link: string; text: string }[] = [
    { link: '/courses', text: 'Courses' },
    { link: '/non-class-meetings', text: 'Non class meetings' },
    { link: '/faculty', text: 'Faculty' },
    { link: '/schedule', text: 'Schedule' },
    { link: '/four-year-plan', text: '4 Year Plan' },
    { link: '/course-admin', text: 'Course Admin' },
    { link: '/faculty-admin', text: 'Faculty Admin' },
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
          { currentUser && (
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
          {tabs.map((tab): ReactElement => (
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
