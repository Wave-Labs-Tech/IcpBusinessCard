import React, { useState } from "react";
import { Notification, CompleteCardData, User } from "../declarations/backend/backend.did"
import { UserAddIcon, UserIcon, UserCircleIcon, PlusIcon } from '@heroicons/react/outline';
import CardDetails from "./CardDetails";
import { Principal } from "@dfinity/principal";

interface NotificationModalProps {
  notifications: Notification[];
  onClose: () => void;
  onSelect: (principal: Principal, date: bigint) => void
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose, onSelect }) => {


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    // onClick={onClose}
    >
      <div className="bg-gray-700 w-[90%] max-w-lg p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
        <ul className="text-left">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li key={index} className=" hover:text-green-500 cursor-pointer mb-2"

              >
                {
                  "ContactRequest" in notification.kind && (
                    <div
                      className="flex"
                      onClick={() => onSelect((notification.kind as { ContactRequest: User }).ContactRequest.principal, notification.date)}
                    >
                      <PlusIcon className="h-5 mr-3" />
                      <div>
                        {notification.kind.ContactRequest.name} ... Te solicitó contacto!
                      </div>
                    </div>
                  )
                }
                {"ContactAccepted" in notification.kind && (
                  <div
                    className="flex"
                    onClick={() => onSelect((notification.kind as { ContactAccepted: User }).ContactAccepted.principal, notification.date)}
                  >
                    <PlusIcon className="h-5 mr-3" />
                    <div>
                      {notification.kind.ContactAccepted.name} ... aceptó tu solicitud de contacto!
                    </div>
                  </div>
                )
                }

              </li>
            ))
          ) : (
            <li className="text-gray-500">No hay notificaciones</li>
          )}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
