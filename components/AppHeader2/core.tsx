import { useAuthContext } from '@/lib/user/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment, useContext, useEffect, useState } from 'react';
import AdminNavbarColumn from './AdminNavbarColumn';
import { useRouter } from 'next/router';
import AdminNavbarGrid from './AdminNavbarGrid';
import { RequestHelper } from '@/lib/request-helper';
import QRScanDialog from './QRScanDialog';
import { SectionReferenceContext } from '@/lib/context/section';
import { NavbarCallbackRegistryContext } from '@/lib/context/navbar';

type Scan = {
  precendence: number;
  name: string;
  isCheckIn: boolean;
  startTime: Date;
  endTime: Date;
  isPermanentScan: boolean;
};

export default function AppHeader2_Core() {
  const { user, hasProfile } = useAuthContext();
  const router = useRouter();
  const isSuperAdmin = user ? user.permissions.indexOf('super_admin') !== -1 : false;
  const isAdmin = isSuperAdmin || (user ? user.permissions.indexOf('admin') !== -1 : false);
  const [scanList, setScanList] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const { faqRef, scheduleRef } = useContext(SectionReferenceContext);
  const { callbackRegistry } = useContext(NavbarCallbackRegistryContext);
  useEffect(() => {
    async function getScanData() {
      const scans = await RequestHelper.get<Scan[]>('/api/scantypes', {
        headers: {
          authorization: user?.token || '',
        },
      });
      setScanList(scans.data);
    }
    if (!isAdmin) {
      setScanList([]);
    } else {
      getScanData();
    }
  }, [user, isAdmin]);
  return (
    <div className="flex justify-center py-2 w-full">
      {/* Real navbar */}
      <div className="relative font-dmSans gap-4 border-[3px] border-[rgba(30,30,30,0.60)] rounded-xl px-20 bg-white opacity-90 p-1 text-[#40B7BA] cursor-pointer w-[60%] lg:w-[45%]">
        <div className="mx-auto w-[70%] flex items-center justify-around">
          <button
            className="p-2 text-[#40B7BA] cursor-pointer"
            onClick={async () => {
              if (Object.hasOwn(callbackRegistry, router.pathname)) {
                await callbackRegistry[router.pathname]();
              }
              if (router.pathname === '/')
                window.scroll({
                  top: 0,
                  behavior: 'smooth',
                });
              else router.push('/');
            }}
          >
            Home
          </button>
          {/* <Link href="/#schedule-section" className="p-2 text-[#40B7BA] cursor-pointer">
      <div className="font-dmSans flex items-center gap-4 border-[3px] border-[rgba(30,30,30,0.60)] rounded-xl px-20 lg:px-[8rem] bg-white relative">
        <Link href="/" className="p-2 text-[#40B7BA] cursor-pointer">
          Home
        </Link>
        <Link href="/#schedule-section" className="p-2 text-[#40B7BA] cursor-pointer">
          Schedule
        </Link>
        <Link href="/hackerpacks" className="p-2 text-[#40B7BA] cursor-pointer">
          Resources
        </Link> 
        </Link>*/}
          <button
            onClick={async () => {
              if (Object.hasOwn(callbackRegistry, router.pathname)) {
                await callbackRegistry[router.pathname]();
              }
              if (router.pathname === '/')
                scheduleRef.current?.scrollIntoView({
                  behavior: 'smooth',
                });
              else {
                router.push('/#schedule-section');
              }
            }}
            className="p-2 text-[#40B7BA] cursor-pointer"
          >
            Schedule
          </button>

          <button
            className="p-2 text-[#40B7BA] cursor-pointer"
            onClick={async () => {
              if (Object.hasOwn(callbackRegistry, router.pathname)) {
                await callbackRegistry[router.pathname]();
              }
              if (router.pathname === '/')
                faqRef.current?.scrollIntoView({
                  behavior: 'smooth',
                });
              else {
                router.push('/#faq-section');
              }
            }}
          >
            FAQ
          </button>
          <QRScanDialog scan={currentScan} onModalClose={() => setCurrentScan(null)} />

          {isAdmin && (
            <Menu as="div">
              <div>
                <Menu.Button className="p-2 cursor-pointer flex items-center gap-x-2">
                  <div className="text-[#40B7BA]">Admin</div>
                  <svg
                    xmlns="http:www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#40B7BA"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right divide-x divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none flex">
                  {isSuperAdmin && (
                    <div className="px-1 py-1 w-1/4">
                      <AdminNavbarColumn
                        sectionTitle="Admin"
                        options={[
                          {
                            optionName: 'User Dashboard',
                            onClick: () => router.push('/admin/users'),
                          },
                          {
                            optionName: 'Stats at a Glance',
                            onClick: () => router.push('/admin/stats'),
                          },
                        ]}
                      />
                    </div>
                  )}
                  <div className="w-1/2 px-1 py-1">
                    <AdminNavbarGrid
                      numCols={2}
                      sectionTitle="Temporary Scans"
                      options={scanList
                        .filter((scan) => !scan.isPermanentScan)
                        .map((scan) => ({
                          optionName: scan.name,
                          onClick: () => setCurrentScan(scan),
                        }))}
                    />
                  </div>
                  <div className="px-1 py-1">
                    <AdminNavbarColumn
                      sectionTitle="Permanent Scans"
                      options={scanList
                        .filter((scan) => scan.isPermanentScan)
                        .map((scan) => ({
                          optionName: scan.name,
                          onClick: () => setCurrentScan(scan),
                        }))}
                    />
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}

          {/*TODO: Readd after applications open*/}
          <div className="p-2 text-white cursor-pointer">
            {user && hasProfile ? (
              <button
                onClick={async () => {
                  if (Object.hasOwn(callbackRegistry, router.pathname)) {
                    await callbackRegistry[router.pathname]();
                  }
                  await router.push('/profile');
                }}
              >
                <div className="py-3 px-5 rounded-[30px] bg-[#40B7BA] font-bold">Profile</div>
              </button>
            ) : (
              <Link href="/register">
                <div className="py-3 px-5 rounded-[30px] bg-[#40B7BA] font-bold">Apply</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
